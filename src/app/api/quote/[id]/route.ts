import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;

  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Sanitize sensitive info for public tracking if needed
    // (In this case, it's just a quote, so it's public)
    return NextResponse.json(quote);
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json({ error: 'Failed to fetch order status' }, { status: 500 });
  }
}
