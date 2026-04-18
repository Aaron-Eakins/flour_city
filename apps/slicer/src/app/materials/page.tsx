'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function MaterialsPage() {
  const materials = [
    {
      name: 'PLA (Polylactic Acid)',
      icon: '🌱',
      tag: 'Best for Prototyping',
      properties: ['Easy to Print', 'Good Detail', 'Biodegradable (Industrial)', 'Low Odor'],
      bestFor: 'Concepts, models, toys, architectural mockups.',
      desc: 'Our workhorse material. Derived from corn starch, it offers the best surface finish and dimensional accuracy for most standard projects.'
    },
    {
      name: 'PETG',
      icon: '🔩',
      tag: 'Best for Function',
      properties: ['Impact Resistant', 'UV Stable', 'Chemical Resistant', 'Food Safe Capable'],
      bestFor: 'Mechanical parts, outdoor usage, water-tight containers.',
      desc: 'Combines the ease of PLA with the durability of more technical filaments. PETG is the ideal choice for parts that need to survive the real world.'
    },
    {
      name: 'ABS',
      icon: '🔥',
      tag: 'Best for Heat',
      properties: ['Rigid', 'Heat Resistant (90°C+)', 'Sandable/Paintable', 'Tough'],
      bestFor: 'Automotive parts, electronics housings, functional prototypes.',
      desc: 'A rugged material that withstands higher temperatures and stress. Ideal for engineering-grade applications that require structural integrity under load.'
    },
    {
      name: 'TPU (95A)',
      icon: '👟',
      tag: 'Best for Flexibility',
      properties: ['Rubber-like', 'High Abrasion Resistance', 'Vibration Dampening', 'Highly Durable'],
      bestFor: 'Phone cases, gaskets, drive belts, tires, seals.',
      desc: 'A flexible, semi-rubbery material that can be compressed and stretched without breaking. Ideal for parts that need to absorb impact or provide a soft grip.'
    }
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 2rem 4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Precision <span className="text-gradient-primary">Materials</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto' }}>
            We stock high-performance engineering grade filaments. 
            Select the right material for your application based on strength, heat, and flexibility.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {materials.map(m => (
            <div key={m.name} className="glass" style={{ padding: '3rem', borderRadius: '32px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2.5rem' }}>
              <div style={{ fontSize: '4rem' }}>{m.icon}</div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.8rem' }}>{m.name}</h2>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: 'rgba(99,102,241,0.1)', 
                    border: '1px solid var(--primary)', 
                    borderRadius: '100px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    color: 'var(--primary)' 
                  }}>
                    {m.tag}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>{m.desc}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Key Properties</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {m.properties.map(p => <li key={p}>✓ {p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Best For</h4>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>{m.bestFor}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section style={{ marginTop: '6rem', textAlign: 'center' }}>
          <div className="glass" style={{ padding: '3rem', borderRadius: '32px', maxWidth: '700px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Unsure which to choose?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
              We'll recommend the best material for your specific use-case during the quoting process.
            </p>
            <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Get a Quote</Link>
          </div>
        </section>
      </div>

      <footer style={{ width: '100%', padding: '4rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Flour City Prints · Rochester, NY
      </footer>
    </main>
  );
}
