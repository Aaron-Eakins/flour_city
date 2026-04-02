import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const [pricingConfig, materials, qualities, infillOptions, colors] = await Promise.all([
      prisma.pricingConfig.findUnique({ where: { id: 1 } }),
      prisma.material.findMany({ orderBy: { name: 'asc' } }),
      prisma.quality.findMany({ orderBy: { name: 'asc' } }),
      prisma.infillOption.findMany({ orderBy: { value: 'asc' } }),
      prisma.color.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({
      pricingConfig: pricingConfig || {
        printerKwhUsage: 0.15, electricityCostPerKwh: 0.2,
        machineLifeHours: 5000, machineCost: 699,
        fixedLaborFee: 2.0, failureBufferPercent: 0.1,
        profitMarginPercent: 0.5, minimumPrice: 5.0
      },
      materials,
      qualities,
      infillOptions,
      colors,
    });
  } catch (error) {
    console.error('Failed to fetch admin config:', error);
    return NextResponse.json({ error: 'Failed to fetch admin config' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Convert string inputs to floats if they are numbers (since form data might be string)
    const updateData: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'notifyOnQuote') {
        updateData[key] = Boolean(value);
      } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        updateData[key] = parseFloat(value as string);
      } else {
        updateData[key] = value;
      }
    }

    const config = await prisma.pricingConfig.upsert({
      where: { id: 1 },
      update: updateData,
      create: { id: 1, ...updateData }
    });
    
    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Failed to update config:', error);
    return NextResponse.json({ error: 'Failed to update config.' }, { status: 500 });
  }
}

