import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();
    
    let result;
    switch (type) {
      case 'material':
        result = await prisma.material.create({ 
          data: { 
            name: data.name, 
            costPerKg: parseFloat(data.costPerKg),
            brand: data.brand || null,
            modelNumber: data.modelNumber || null,
            colorName: data.colorName || null,
            colorHex: data.colorHex || null,
            sku: data.sku || null,
            materialType: data.materialType || 'PLA',
            amsSlot: data.amsSlot ? parseInt(data.amsSlot) : null
          } 
        });
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

      case 'nozzle':
        result = await prisma.nozzleDiameter.create({ 
          data: { 
            diameter: parseFloat(data.diameter),
            label: data.label || `${data.diameter}mm`,
            isDefault: data.isDefault || false,
            swapFee: data.swapFee ? parseFloat(data.swapFee) : 0.0
          } 
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to add option:', error);
    return NextResponse.json({ error: 'Failed to add option.' }, { status: 500 });
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

      case 'nozzle':
        result = await prisma.nozzleDiameter.delete({ where: { id } });
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
            name: updateData.name,
            costPerKg: updateData.costPerKg !== undefined ? parseFloat(updateData.costPerKg) : undefined,
            brand: updateData.brand,
            modelNumber: updateData.modelNumber,
            colorName: updateData.colorName,
            colorHex: updateData.colorHex,
            sku: updateData.sku,
            materialType: updateData.materialType,
            amsSlot: updateData.amsSlot !== undefined ? (updateData.amsSlot ? parseInt(updateData.amsSlot) : null) : undefined
          } 
        });
        break;
      case 'quality':
        result = await prisma.quality.update({ 
          where: { id }, 
          data: { 
            enabled: updateData.enabled,
            name: updateData.name,
            timeMultiplier: updateData.timeMultiplier !== undefined ? parseFloat(updateData.timeMultiplier) : undefined
          } 
        });
        break;
      case 'infill':
        result = await prisma.infillOption.update({ 
          where: { id }, 
          data: { enabled: updateData.enabled, value: updateData.value !== undefined ? parseInt(updateData.value) : undefined } 
        });
        break;

      case 'nozzle':
        result = await prisma.nozzleDiameter.update({ 
          where: { id }, 
          data: { 
            enabled: updateData.enabled, 
            diameter: updateData.diameter !== undefined ? parseFloat(updateData.diameter) : undefined,
            label: updateData.label,
            isDefault: updateData.isDefault,
            swapFee: updateData.swapFee !== undefined ? parseFloat(updateData.swapFee) : undefined
          } 
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

