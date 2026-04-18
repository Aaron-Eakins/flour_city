'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Analyze Your Part',
      desc: 'Simply upload your STL or 3MF file to our quote engine. We perform a real-time mesh analysis to calculate volume, orientation, and build-plate fit.',
      icon: '🔍'
    },
    {
      step: '02',
      title: 'Automated Quoting',
      desc: 'No waiting for a callback. Our instant quote engine determines price based on material type, quality tier, and the actual mesh diagnostics of your file.',
      icon: '⚡'
    },
    {
      step: '03',
      title: 'Precision Fabrication',
      desc: 'Once payment is confirmed, your part is queued for our high-speed Bambu P1S fleet. We monitor every layer for quality and accuracy.',
      icon: '🏗️'
    },
    {
      step: '04',
      title: 'Express Retrieval',
      desc: 'We offer same-day express turnaround for priority orders. Pick up your parts safely in Brighton/Henrietta or opt for flat-rate shipping.',
      icon: '🚚'
    }
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 2rem 4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>How It <span className="text-gradient-primary">Works</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto' }}>
            We've simplified the industrial 3D printing process.
            Professional prototypes are now just a few clicks away.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
          {steps.map(s => (
            <div key={s.step} className="glass" style={{ padding: '2.5rem', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '6rem', opacity: 0.03, fontWeight: 'bold' }}>{s.step}</div>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{s.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <section className="glass" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Our <span className="text-gradient">Local</span> Advantage</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', textAlign: 'left' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'white' }}>Small-Business Speed</h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                We don't have the overhead of massive bureaus. We focus on local startups, inventors, and enthusiasts in Rochester to provide personalized service and rapid iteration.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'white' }}>Transparency First</h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                We believe in upfront pricing. No hidden "handling" or "setup" fees beyond our standard flat fee. What you see on the screen is what you pay.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Analyze Your Part</Link>
          </div>
        </section>
      </div>

      <footer style={{ width: '100%', padding: '4rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Flour City Prints · Rochester, NY
      </footer>
    </main>
  );
}
