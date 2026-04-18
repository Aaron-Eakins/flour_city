import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db';
import { sendOrderStatusEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const quoteId = session.metadata?.quoteId;
    const customerEmail = session.customer_details?.email || null;

    if (quoteId) {
      try {
        const quote = await prisma.quote.update({
          where: { id: quoteId },
          data: { 
            status: 'PAID',
            customerEmail: customerEmail
          }
        });

        if (customerEmail && process.env.RESEND_API_KEY) {
          await sendOrderStatusEmail(customerEmail, 'PAID', quote.id, quote.fileName);
        }
      } catch (dbErr) {
        console.error('Error updating quote status in database:', dbErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
