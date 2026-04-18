'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem 4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>About <span className="text-gradient-primary">Flour City</span> Prints</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto' }}>
            Precision fabrication for the modern Rochester.
          </p>
        </div>

        <section className="glass" style={{ padding: '3.5rem', borderRadius: '32px', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Our Mission</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Flour City Prints was founded to close the gap between ideas and physical reality. We believe that 3D printing shouldn't be a complex technical hurdle—it should be a powerful tool accessible to every Rochester creator, startup, and small business.
          </p>
          <div style={{ padding: '2rem', background: 'rgba(99,102,241,0.05)', border: '1px solid var(--primary)', borderRadius: '16px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white', marginBottom: '0.5rem' }}>Rochester First</p>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
              We prioritize local startups and inventors. By offering zero-cost pickup and express local turnaround, we help our neighbors innovate faster and cheaper than the massive online bureaus.
            </p>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Our Fleet</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
              We operate high-performance Bambu P1S machines with AMS (Automatic Material System) capabilities, allowing for multi-color engineering parts that maintain structural integrity.
            </p>
          </div>
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>The Vision</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
              To provide the fastest iteration cycle for hardware in Rochester. Whether you're a student at RIT or a startup in the High Falls district, we are your local fabrication partner.
            </p>
          </div>
        </div>

        <section style={{ textAlign: 'center', marginTop: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Ready to <span className="text-gradient">Innovate</span>?</h2>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Get an Instant Quote</Link>
        </section>
      </div>

      <footer style={{ width: '100%', padding: '4rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Flour City Prints · Rochester, NY
      </footer>
    </main>
  );
}
