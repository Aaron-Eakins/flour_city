import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      where: { enabled: true },
      select: {
        materialType: true,
        basePrice: true,
        pricePerGram: true,
      },
      distinct: ['materialType'],
    });

    // Grouping by materialType to return a clean summary
    const summary = materials.map(m => ({
      type: m.materialType,
      startingAt: m.basePrice,
      perGram: m.pricePerGram || 0.10, // Fallback if not set
    }));

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Failed to fetch pricing summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
