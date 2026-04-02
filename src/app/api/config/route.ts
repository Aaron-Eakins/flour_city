import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const [materials, qualities, infillOptions, colors] = await Promise.all([
      prisma.material.findMany({ where: { enabled: true }, orderBy: { name: 'asc' } }),
      prisma.quality.findMany({ where: { enabled: true }, orderBy: { name: 'asc' } }),
      prisma.infillOption.findMany({ where: { enabled: true }, orderBy: { value: 'asc' } }),
      prisma.color.findMany({ where: { enabled: true }, orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({
      materials,
      qualities,
      infillOptions,
      colors,
    });
  } catch (error) {
    console.error('Failed to fetch config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
