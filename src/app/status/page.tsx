import prisma from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StatusPage({ searchParams }: { searchParams: Promise<{ quoteId?: string }> }) {
  const { quoteId } = await searchParams;
  const trimmedId = quoteId?.trim();

  let quote = null;
  let errorMsg = null;

  if (trimmedId) {
    try {
      quote = await prisma.quote.findUnique({
        where: { id: trimmedId }
      });
      if (!quote) {
        errorMsg = 'Order not found. Please check your tracking ID.';
      }
    } catch (e) {
      errorMsg = 'Invalid tracking ID format.';
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Order Status</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Enter your Quote ID to track the progress of your 3D print.
        </p>

        <form method="GET" action="/status" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
          <input 
            type="text" 
            name="quoteId" 
            defaultValue={quoteId || ''} 
            placeholder="Paste your order ID" 
            style={{ flex: 1, padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
            required 
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem' }}>Track</button>
        </form>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'left', marginBottom: '2rem' }}>
          Your order ID was emailed to you at checkout.
        </p>

        {errorMsg && (
          <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {quote && (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', textAlign: 'left', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.9)' }}>Order Details</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Status:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                {quote.status === 'QUOTED' ? 'Pending Payment' : quote.status}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>File:</span>
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>{quote.fileName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Specs:</span>
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>{(quote as any).material || 'PLA'} • {(quote as any).color || 'Black'} • x{(quote as any).quantity || 1}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Total:</span>
              <span style={{ fontWeight: 'bold' }}>${quote.totalCost.toFixed(2)}</span>
            </div>

            {quote.status === 'QUOTED' && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--error)', marginBottom: '1rem' }}>This order has not been paid yet.</p>
              </div>
            )}
            
            {['PAID', 'PRINTING', 'SHIPPED'].includes(quote.status) && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                   <div style={{ height: '100%', width: quote.status === 'PAID' ? '33%' : quote.status === 'PRINTING' ? '66%' : '100%', background: 'var(--success)', transition: 'width 0.5s ease' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: quote.status === 'PAID' ? 'white' : 'inherit' }}>Paid</span>
                  <span style={{ color: quote.status === 'PRINTING' ? 'white' : 'inherit' }}>Printing</span>
                  <span style={{ color: quote.status === 'SHIPPED' ? 'white' : 'inherit' }}>Shipped</span>
                </div>
              </div>
            )}
          </div>
        )}

        <Link href="/" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block', border: 'none' }}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
