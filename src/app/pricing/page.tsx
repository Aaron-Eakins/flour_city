'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PricingPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/pricing-summary');
        const data = await res.json();
        setMaterials(data.materials || []);
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 2rem 4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Transparent <span className="text-gradient-primary">Pricing</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            No hidden fees. No minimums. Just high-quality 3D printing at honest rates.
          </p>
        </div>

        <section className="glass" style={{ padding: '3rem', borderRadius: '32px', marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Our Materials</h2>
          
          {loading ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>Loading material catalog...</div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {materials.map(m => (
                <div key={m.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.5rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{m.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>{m.brand} · {m.colorName || 'Standard'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${(m.pricePerGram || (m.costPerKg / 1000 * 3)).toFixed(2)} / gram</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>+ ${m.basePrice || 5.0} setup fee</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Logistics & Delivery</h3>
            <ul style={{ listStyle: 'none', padding: 0, color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
              <li>📍 <strong>Local Pickup (Rochester):</strong> Free</li>
              <li>🚚 <strong>Flat Rate Shipping:</strong> $5.00</li>
              <li>📅 <strong>Standard Turnaround:</strong> Included</li>
              <li>⚡ <strong>Express (Same Day):</strong> +50% total</li>
            </ul>
          </div>
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ready to print?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Upload your STL or 3MF file to get a final quote in seconds.</p>
              <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Get an Instant Quote</Link>
            </div>
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '8rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>🛠️</div>
          </div>
        </section>
      </div>

      <footer style={{ width: '100%', padding: '4rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Flour City Prints · Rochester, NY
      </footer>
    </main>
  );
}
