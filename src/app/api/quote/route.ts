import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import prisma from '@/lib/db';
import { calculateQuote } from '@/lib/quoteEngine';
import { sendQuoteGeneratedEmail } from '@/lib/email';

const execFileAsync = promisify(execFile);

function parsePrintTime(timeStr: string): number {
  let totalHours = 0;
  const hMatch = timeStr.match(/(\d+)h/);
  if (hMatch) totalHours += parseInt(hMatch[1], 10);
  const mMatch = timeStr.match(/(\d+)m/);
  if (mMatch) totalHours += parseInt(mMatch[1], 10) / 60;
  const sMatch = timeStr.match(/(\d+)s/);
  if (sMatch) totalHours += parseInt(sMatch[1], 10) / 3600;
  return totalHours || 1;
}

export async function POST(req: NextRequest) {
  let tempDir = '';

  try {
    console.log('Incoming quote request...');
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('No file in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes)`);

    const material = formData.get('material') as string || 'PLA';
    const quality = formData.get('quality') as string || 'Standard';
    const infill = parseInt((formData.get('infill') as string) || '15', 10);
    const color = formData.get('color') as string || 'Black';
    const quantity = parseInt((formData.get('quantity') as string) || '1', 10);

    const ext = file.name.toLowerCase().endsWith('.3mf') ? '.3mf' : '.stl';
    const uuid = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    tempDir = path.join(os.tmpdir(), uuid);
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, `model${ext}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);

    console.log(`Temp file written to ${tempFilePath}`);

    const slicerPath = process.env.SLICER_PATH || 'orca-slicer';
    let weightGrams = 0;
    let printTimeHours = 0;

    // Check if we should even try the slicer (often missing on Vercel)
    let slicerFound = false;
    try {
      if (slicerPath === 'orca-slicer') {
        // Just checking if orca-slicer is in PATH might be hard, 
        // we'll rely on the exec throw but with cleaner message
        slicerFound = true; 
      } else {
        await fs.access(slicerPath, fs.constants.X_OK);
        slicerFound = true;
      }
    } catch {
      slicerFound = false;
    }

    if (slicerFound) {
      try {
        console.log('Attempting to run slicer CLI...');
        const command = process.platform === 'linux' ? 'xvfb-run' : slicerPath;
        const args = process.platform === 'linux' 
          ? ['-a', slicerPath, '--slice', '0', '--outputdir', tempDir, tempFilePath] 
          : ['--slice', '0', '--outputdir', tempDir, tempFilePath];
        
        await execFileAsync(command, args, { timeout: 30000 });
        console.log('Slicer completed successfully.');

        const filesInDir = await fs.readdir(tempDir);
        const gcodeFiles = filesInDir.filter(f => f.endsWith('.gcode'));

        if (gcodeFiles.length > 0) {
          for (const gcodeFile of gcodeFiles) {
            const gcodePath = path.join(tempDir, gcodeFile);
            const gcodeContent = await fs.readFile(gcodePath, 'utf8');
            
            const weightMatch = gcodeContent.match(/;\s*total filament used \[g\]\s*=\s*([0-9.]+)/);
            if (weightMatch) weightGrams += parseFloat(weightMatch[1]);

            const timeMatch = gcodeContent.match(/;\s*estimated printing time[^=]*=\s*(.+)/);
            if (timeMatch) printTimeHours += parsePrintTime(timeMatch[1]);
          }
        }
      } catch (e: any) {
        console.warn("Slicer CLI failed or timeout. Checking for fallback...", e.message);
        if (process.env.MOCK_FALLBACK === 'false') {
          throw new Error(`Slicer execution failed: ${e.stderr || e.message}`);
        }
      }
    } else {
      console.log('Slicer binary not found/not executable. Skipping to fallback.');
    }

    // Secondary Check: if slicer produced no metrics (or we skipped it)
    if (weightGrams === 0 || printTimeHours === 0) {
      if (process.env.MOCK_FALLBACK !== 'false') {
        console.log('Using mock pricing fallback logic.');
        const sizeMb = buffer.length / (1024 * 1024);
        weightGrams = Math.max(10, sizeMb * 15);
        printTimeHours = Math.max(0.5, sizeMb * 0.4);
      } else {
        return NextResponse.json({ error: 'Slicer failed and mock fallback is disabled.' }, { status: 500 });
      }
    }

    console.log(`Final metrics: ${weightGrams}g, ${printTimeHours}h`);

    // Fetch pricing config from DB
    let config;
    try {
      config = await prisma.pricingConfig.findFirst() || {};
    } catch (dbErr) {
      console.error('Database error fetching PricingConfig:', dbErr);
      config = {}; // Fallback to hardcoded defaults in engine
    }
    
    // Fetch all dynamic options
    const [materialData, qualityData, infillData, colorData] = await Promise.all([
      prisma.material.findUnique({ where: { name: material, enabled: true } }).catch(() => null),
      prisma.quality.findUnique({ where: { name: quality, enabled: true } }).catch(() => null),
      prisma.infillOption.findUnique({ where: { value: infill, enabled: true } }).catch(() => null),
      prisma.color.findUnique({ where: { name: color, enabled: true } }).catch(() => null)
    ]);

    if (!materialData || !qualityData || !infillData || !colorData) {
      console.warn('Configuration mismatch - one or more options missing in DB');
      return NextResponse.json({ 
        error: 'One or more selected options are no longer available. Please refresh and try again.' 
      }, { status: 400 });
    }

    const materialCostPerKg = materialData.costPerKg;
    const qualityMultiplier = (qualityData as any).timeMultiplier || 1.0;

    const quoteBreakdown = calculateQuote(weightGrams, printTimeHours, config, {
      material, quality, infill, quantity, materialCostPerKg, qualityMultiplier
    });

    // Save Quote to the Database
    const savedQuote = await prisma.quote.create({
      data: {
        fileName: file.name,
        material,
        quality,
        infill,
        color,
        quantity,
        materialCost: quoteBreakdown.breakdown.materialCost,
        electricityCost: quoteBreakdown.breakdown.electricityCost,
        laborCost: quoteBreakdown.breakdown.labor,
        depreciation: quoteBreakdown.breakdown.machineDepreciation,
        totalCost: quoteBreakdown.totalCost,
        printTimeHours: quoteBreakdown.metrics.printTimeHours,
        weightGrams: quoteBreakdown.metrics.weightGrams,
        status: "QUOTED"
      }
    });

    console.log(`Quote saved successfully with ID: ${savedQuote.id}`);

    try {
      if ((config as any)?.notifyOnQuote && process.env.RESEND_API_KEY) {
        const adminEmail = process.env.ADMIN_EMAIL || 'onboarding@resend.dev';
        await sendQuoteGeneratedEmail(adminEmail, savedQuote.fileName, savedQuote.totalCost, savedQuote.id);
      }
    } catch (metricErr) {
      console.error('Non-fatal error notifying admin:', metricErr);
    }

    return NextResponse.json({
      dbQuoteId: savedQuote.id,
      quoteData: quoteBreakdown
    });

  } catch (error: any) {
    console.error('CRITICAL ERROR in quote API:', error);
    return NextResponse.json({ error: error.message || 'Failed to process 3D model.' }, { status: 500 });
  } finally {
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log('Temp cleanup complete.');
      } catch (cleanupError) {}
    }
  }
}
