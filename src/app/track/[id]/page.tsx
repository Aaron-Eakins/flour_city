'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function TrackPage({ params }: { params: { id: string } }) {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch(`/api/quote/${params.id}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setQuote(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [params.id]);

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-pulse">Locating order...</div>
    </main>
  );

  if (error || !quote) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>🔍</div>
      <h1 style={{ fontSize: '1.5rem' }}>Order Not Found</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>We couldn't find an order with ID: {params.id}</p>
      <Link href="/" className="btn-secondary">Return Home</Link>
    </main>
  );

  const statusColors: any = {
    'QUOTED': 'rgba(255,255,255,0.2)',
    'PAID': 'var(--primary)',
    'PRINTING': '#fbbf24',
    'SHIPPED': 'var(--success)',
    'PICKUP_READY': 'var(--success)',
    'COMPLETED': 'var(--success)',
  };

  const statusLabels: any = {
    'QUOTED': 'Quote Generated',
    'PAID': 'Payment Received',
    'PRINTING': 'On the Bed',
    'SHIPPED': 'Dispatched',
    'PICKUP_READY': 'Ready for Pickup',
    'COMPLETED': 'Finished',
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem 4rem 2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Tracking</p>
            <h1 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{quote.fileName}</h1>
          </div>
          <div style={{ 
            background: statusColors[quote.status] || 'rgba(255,255,255,0.1)', 
            padding: '4px 12px', 
            borderRadius: '100px', 
            fontSize: '0.75rem', 
            fontWeight: 'bold',
            color: (quote.status === 'QUOTED') ? 'white' : 'var(--background)'
          }}>
            {statusLabels[quote.status] || quote.status}
          </div>
        </div>

        <section className="glass" style={{ padding: '3rem', borderRadius: '32px', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>Current Progress</div>
          <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ 
              height: '100%', 
              width: quote.status === 'COMPLETED' ? '100%' : (quote.status === 'SHIPPED' || quote.status === 'PICKUP_READY') ? '90%' : quote.status === 'PRINTING' ? '50%' : '10%',
              background: 'var(--primary)',
              transition: 'width 1s cubic-bezier(1,0,0,1)'
            }} />
          </div>
          <p style={{ fontSize: '1.1rem' }}>
            {quote.status === 'QUOTED' ? 'Awaiting payment to begin production.' : 
             quote.status === 'PAID' ? 'Queued for the next available printer.' :
             quote.status === 'PRINTING' ? 'Your part is currently being fabricated.' :
             'Order complete! See details below.'}
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Specs</p>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>Material: <strong>{quote.material}</strong></div>
              <div>Quality: <strong>{quote.quality}</strong></div>
              <div>Turnaround: <strong>{quote.turnaroundTier}</strong></div>
            </div>
          </div>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Logistics</p>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>Method: <strong>{quote.deliveryMethod}</strong></div>
              <div>Weight: <strong>{quote.weightGrams.toFixed(1)}g</strong></div>
              <div>Total: <strong>${quote.totalCost.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>

        {quote.status === 'QUOTED' && (
           <div style={{ textAlign: 'center' }}>
             <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Complete Payment</Link>
           </div>
        )}
      </div>
    </main>
  );
}
