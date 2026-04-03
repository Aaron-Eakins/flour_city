'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      padding: '1.5rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      zIndex: 100
    }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></div>
          Flour City Prints
        </div>
      </Link>
      
      <div className="fcp-nav-links" style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}>Get a Quote</Link>
        <Link href="/materials" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)' }}>Materials</Link>
        <Link href="/how-it-works" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)' }}>How It Works</Link>
        <Link href="/pricing" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)' }}>Pricing</Link>
        <Link href="/about" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)' }}>About</Link>
      </div>
    </nav>
  );
}
