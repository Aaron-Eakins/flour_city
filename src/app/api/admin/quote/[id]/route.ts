import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendOrderStatusEmail } from '@/lib/email';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
    }

    const { id } = await params;

    const quote = await prisma.quote.update({
      where: { id },
      data: { status }
    });

    if (quote.customerEmail && process.env.RESEND_API_KEY) {
      // Send the status update email in the background
      sendOrderStatusEmail(quote.customerEmail, status, quote.id, quote.fileName).catch(err => {
        console.error('Background email failed:', err);
      });
    }

    return NextResponse.json(quote);

  } catch (error) {
    console.error('Failed to update quote:', error);
    return NextResponse.json({ error: 'Failed to update quote.' }, { status: 500 });
  }
}
