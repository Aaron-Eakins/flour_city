import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();
    
    let result;
    switch (type) {
      case 'material':
        result = await prisma.material.create({ data: { name: data.name, costPerKg: parseFloat(data.costPerKg) } });
        break;
      case 'quality':
        result = await prisma.quality.create({ 
          data: { 
            name: data.name,
            timeMultiplier: data.timeMultiplier ? parseFloat(data.timeMultiplier) : 1.0
          } 
        });
        break;
      case 'infill':
        result = await prisma.infillOption.create({ data: { value: parseInt(data.value) } });
        break;
      case 'color':
        result = await prisma.color.create({ data: { name: data.name } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to add option:', error);
    return NextResponse.json({ error: 'Failed to add option. Check for duplicates.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (!type || !id) return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });

    let result;
    switch (type) {
      case 'material':
        result = await prisma.material.delete({ where: { id } });
        break;
      case 'quality':
        result = await prisma.quality.delete({ where: { id } });
        break;
      case 'infill':
        result = await prisma.infillOption.delete({ where: { id } });
        break;
      case 'color':
        result = await prisma.color.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to delete option:', error);
    return NextResponse.json({ error: 'Failed to delete option.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { type, id, ...updateData } = await req.json();
    
    if (!type || !id) return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });

    let result;
    switch (type) {
      case 'material':
        result = await prisma.material.update({ 
          where: { id }, 
          data: { 
            enabled: updateData.enabled,
            costPerKg: updateData.costPerKg ? parseFloat(updateData.costPerKg) : undefined
          } 
        });
        break;
      case 'quality':
        result = await prisma.quality.update({ 
          where: { id }, 
          data: { 
            enabled: updateData.enabled,
            timeMultiplier: updateData.timeMultiplier ? parseFloat(updateData.timeMultiplier) : undefined
          } 
        });
        break;
      case 'infill':
        result = await prisma.infillOption.update({ 
          where: { id }, 
          data: { enabled: updateData.enabled } 
        });
        break;
      case 'color':
        result = await prisma.color.update({ 
          where: { id }, 
          data: { enabled: updateData.enabled } 
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to update option:', error);
    return NextResponse.json({ error: 'Failed to update option.' }, { status: 500 });
  }
}
