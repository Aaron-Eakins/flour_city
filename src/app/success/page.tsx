import Stripe from 'stripe';
import prisma from '@/lib/db';
import Link from 'next/link';
import { sendOrderStatusEmail } from '@/lib/email';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--error)' }}>Invalid Session</h1>
        <p>No checkout session ID provided.</p>
        <Link href="/" className="btn-primary" style={{ marginTop: '2rem', textDecoration: 'none' }}>Return Home</Link>
      </main>
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const quoteId = session.metadata?.quoteId;

    if (!quoteId) throw new Error('No quote ID found in session metadata');

    const customerEmail = session.customer_details?.email || null;

    // Check if the webhook already processed this
    const currentQuote = await prisma.quote.findUnique({ where: { id: quoteId } });
    if (!currentQuote) throw new Error('Quote not found in database');

    let quote = currentQuote;
    
    // Only update and send email if it hasn't been updated yet
    if (currentQuote.status !== 'PAID' && currentQuote.status !== 'PRINTING' && currentQuote.status !== 'SHIPPED') {
      quote = await prisma.quote.update({
        where: { id: quoteId },
        data: { 
          status: 'PAID',
          customerEmail: customerEmail
        }
      });

      if (customerEmail && process.env.RESEND_API_KEY) {
        await sendOrderStatusEmail(customerEmail, 'PAID', quote.id, quote.fileName);
      }
    }

    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Order Confirmed!</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '2rem' }}>
            Thank you for your business. Payment received for <strong style={{ color: 'white' }}>{quote.fileName}</strong>!
          </p>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', textAlign: 'left', marginBottom: '2rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>ORDER DETAILS</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Quote ID:</span>
              <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)' }}>{quote.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Total Paid:</span>
              <span style={{ fontWeight: 'bold' }}>${quote.totalCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Status:</span>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{quote.status}</span>
            </div>
          </div>

          <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: '100%', maxWidth: '300px' }}>
            Submit Another Quote
          </Link>
        </div>
      </main>
    );

  } catch (err) {
    console.error('Error verifying Stripe session:', err);
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--error)' }}>Verification Failed</h1>
        <p>There was an issue verifying your payment. Please contact support.</p>
        <Link href="/" className="btn-primary" style={{ marginTop: '2rem', textDecoration: 'none' }}>Return Home</Link>
      </main>
    );
  }
}
