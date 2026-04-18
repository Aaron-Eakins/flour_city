import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  try {
    const { quoteId } = await req.json();

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required.' }, { status: 400 });
    }

    // Look up the official quote securely in our database
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
    }

    if (quote.status === 'PAID') {
      return NextResponse.json({ error: 'Quote has already been paid.' }, { status: 400 });
    }

    // Convert decimal to Stripe API standard flat integer (cents)
    const totalAmountCents = Math.round(quote.totalCost * 100);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `3D Print: ${quote.fileName}`,
              description: `Material: ${(quote as any).material || 'PLA'} (${(quote as any).color || 'Black'}) | x${(quote as any).quantity || 1} | Weight: ${Math.round(quote.weightGrams)}g`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/`,
      metadata: {
        quoteId: quote.id,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Failed to create Stripe Checkout session.' }, { status: 500 });
  }
}
