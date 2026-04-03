import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { del } from '@vercel/blob';
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
  let blobUrl: string | null = null;

  try {
    console.log('Incoming quote request...');

    // The client now sends JSON with a blob URL instead of the raw file.
    // This keeps the request body tiny (well under Vercel's 4.5MB limit).
    const body = await req.json();
    blobUrl = body.blobUrl as string;
    const fileName = body.fileName as string;

    if (!blobUrl || !fileName) {
      return NextResponse.json({ error: 'Missing blobUrl or fileName' }, { status: 400 });
    }

    const material = (body.material as string) || 'PLA';
    const quality = (body.quality as string) || 'Standard';
    const infill = parseInt((body.infill as string) || '15', 10);
    const quantity = parseInt((body.quantity as string) || '1', 10);
    const nozzleId = (body.nozzleId as string) || null;
    const isMultiColor = body.isMultiColor === true;
    const selectedSlots = ((body.selectedSlots as any[]) || []).map(s => parseInt(s.toString(), 10));
    const colorTransitions = parseInt((body.colorTransitions as string) || '0', 10);
    const layerCount = body.layerCount ? parseInt(body.layerCount as string, 10) : 0;





    console.log(`Processing file: ${fileName} from blob: ${blobUrl}`);

    // Download the file from blob storage into a temp directory
    const ext = fileName.toLowerCase().endsWith('.3mf') ? '.3mf' : '.stl';
    const uuid = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    tempDir = path.join(os.tmpdir(), uuid);
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, `model${ext}`);

    console.log(`Downloading model from: ${blobUrl}`);
    
    // Vercel Blob storage can sometimes have a tiny consistency delay (404) immediately after upload.
    // We retry up to 3 times with exponential backoff (1s, 2s, 4s).
    let blobResponse = await fetch(blobUrl);
    let attempts = 1;
    const maxAttempts = 3;

    while (!blobResponse.ok && (blobResponse.status === 404 || blobResponse.status >= 500) && attempts < maxAttempts) {
      const delay = Math.pow(2, attempts - 1) * 1000;
      console.warn(`Fetch attempt ${attempts} failed with ${blobResponse.status}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      blobResponse = await fetch(blobUrl);
      attempts++;
    }

    if (!blobResponse.ok) {
      console.error(`Failed to fetch blob after retry. Status: ${blobResponse.status} ${blobResponse.statusText}`);
      const errorText = await blobResponse.text().catch(() => 'No response body');
      console.error(`Blob error detail: ${errorText.slice(0, 200)}`);
      throw new Error(`Failed to fetch model from blob storage: ${blobResponse.status}`);
    }

    const arrayBuffer = await blobResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath, buffer);

    console.log(`Model downloaded and written to ${tempFilePath} (${buffer.length} bytes)`);

    const slicerPath = process.env.SLICER_PATH || 'orca-slicer';
    let weightGrams = 0;
    let printTimeHours = 0;

    // Try the slicer if a custom path is configured
    let slicerFound = false;
    try {
      if (slicerPath !== 'orca-slicer') {
        await fs.access(slicerPath, fs.constants.X_OK);
        slicerFound = true;
      }
      // Default 'orca-slicer' is never available on Vercel -- skip immediately
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
        console.warn('Slicer CLI failed or timed out. Falling back to estimate.', e.message);
      }
    } else {
      console.log('Slicer binary not available (expected on Vercel). Using size-based estimate.');
    }

    // Fallback: derive weight/time estimates from file size
    if (weightGrams === 0 || printTimeHours === 0) {
      const sizeMb = buffer.length / (1024 * 1024);
      weightGrams = Math.max(10, sizeMb * 15);
      printTimeHours = Math.max(0.5, sizeMb * 0.4);
      console.log(`Fallback estimate: ${weightGrams.toFixed(1)}g, ${printTimeHours.toFixed(2)}h (file: ${sizeMb.toFixed(2)}MB)`);
    }

    console.log(`Final metrics: ${weightGrams}g, ${printTimeHours}h`);

    // Fetch pricing config from DB
    let config;
    try {
      config = await prisma.pricingConfig.findFirst() || {};
    } catch (dbErr) {
      console.error('Database error fetching PricingConfig:', dbErr);
      config = {};
    }

    // Fetch all dynamic options
    // Material: Try a direct match first, then fall back to a "contains" search if needed.
    let materialData = await prisma.material.findUnique({ where: { name: material, enabled: true } }).catch(() => null);
    
    if (!materialData) {
      // Robust fallback: Find first enabled material that matches or contains the search string
      materialData = await prisma.material.findFirst({
        where: {
          OR: [
            { name: { contains: material, mode: 'insensitive' } },
            // If the input is "ABS", it matches "ABS (Heat Resistant)"
            { name: { startsWith: material.split(' ')[0], mode: 'insensitive' } }
          ],
          enabled: true,
        }
      }).catch(() => null);
    }

    const [qualityData, infillData] = await Promise.all([
      prisma.quality.findUnique({ where: { name: quality, enabled: true } }).catch(() => null),
      prisma.infillOption.findUnique({ where: { value: infill, enabled: true } }).catch(() => null),
    ]);

    let amsMaterials: any[] = [];
    if (isMultiColor && selectedSlots.length > 0) {
      amsMaterials = await prisma.material.findMany({
        where: { amsSlot: { in: selectedSlots }, enabled: true }
      });
    }


    let nozzleData = nozzleId ? await prisma.nozzleDiameter.findFirst({ where: { id: nozzleId, enabled: true } }).catch(() => null) : null;
    if (!nozzleData) {
      nozzleData = await prisma.nozzleDiameter.findFirst({ where: { label: { contains: '0.4' }, enabled: true } }).catch(() => null);
      if (!nozzleData) nozzleData = await prisma.nozzleDiameter.findFirst({ where: { enabled: true } }).catch(() => null);
    }



    if (!materialData || !qualityData || !infillData) {
      const missing = [];
      if (!materialData) missing.push(`Material '${material}'`);
      if (!qualityData) missing.push(`Quality '${quality}'`);
      if (!infillData) missing.push(`Infill '${infill}%'`);
      
      console.warn(`Configuration mismatch -- missing: ${missing.join(', ')}`);
      return NextResponse.json({
        error: `One or more selected options (${missing.join(', ')}) are no longer available. Please refresh and try again.`,
      }, { status: 400 });
    }


    const materialCostPerKg = materialData.costPerKg;
    const qualityMultiplier = (qualityData as any).timeMultiplier || 1.0;

    const quoteBreakdown = calculateQuote(weightGrams, printTimeHours, config, {
      material, 
      quality, 
      infill, 
      quantity, 
      materialCostPerKg, 
      qualityMultiplier,
      nozzleSwapFee: nozzleData?.swapFee || 0,
      isMultiColor,
      selectedSlots,
      colorTransitions,
      amsMaterials,
      layerCount
    });



    // Save quote to DB
    const savedQuote = await prisma.quote.create({
      data: {
        fileName,
        material,
        quality,
        infill,
        quantity,
        materialCost: quoteBreakdown.breakdown.materialCost,
        electricityCost: quoteBreakdown.breakdown.electricityCost,
        laborCost: quoteBreakdown.breakdown.labor,
        depreciation: quoteBreakdown.breakdown.machineDepreciation,
        totalCost: quoteBreakdown.totalCost,
        printTimeHours: quoteBreakdown.metrics.printTimeHours,
        weightGrams: quoteBreakdown.metrics.weightGrams,
        status: 'QUOTED',
        nozzleDiameterId: nozzleData?.id,
        nozzleSwapFee: nozzleData?.swapFee || 0,
        isMultiColor,
        selectedSlots,
        colorTransitions,
        purgeWasteCost: quoteBreakdown.breakdown.amsPurgeCost || 0,
        primeTowerCost: 0, // Simplified for now
        layerCount,
      },

    });

    console.log(`Quote saved with ID: ${savedQuote.id}`);

    // Send admin notification if configured
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
      quoteData: quoteBreakdown,
    });

  } catch (error: any) {
    console.error('CRITICAL ERROR in quote API:', error);
    return NextResponse.json({ error: error.message || 'Failed to process 3D model.' }, { status: 500 });
  } finally {
    // Clean up temp directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log('Temp cleanup complete.');
      } catch (cleanupError) {
        console.warn('Temp cleanup failed (non-fatal):', cleanupError);
      }
    }

    // Delete the blob now that we've processed the file (requires BLOB_READ_WRITE_TOKEN)
    if (blobUrl && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(blobUrl);
        console.log('Blob deleted:', blobUrl);
      } catch (blobDeleteErr) {
        console.warn('Blob delete failed (non-fatal):', blobDeleteErr);
      }
    } else if (blobUrl && !process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('BLOB_READ_WRITE_TOKEN is missing. Skipping blob deletion.');
    }
  }
}
