import Navbar from '@/components/Navbar';
import Link from 'next/link';

export const metadata = {
  title: 'Local 3D Printing Rochester NY | Flour City Prints',
  description: 'Fast, reliable 3D printing in Rochester, New York. Local pickup available. Get an instant automated quote for PLA, PETG, and multi-color prints.',
  keywords: '3d printing rochester ny, rapid prototyping rochester, bambu printing rochester, custom 3d prints ny',
};

export default function RochesterPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 2rem 4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ display: 'inline-block', padding: '8px 24px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>
            Proudly Rochester, NY
          </div>
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Local 3D <span className="text-gradient-primary">Printing</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto' }}>
            Tired of waiting weeks for parts to ship from China or the West Coast? 
            We provide precision fabrication right here in the Flower City.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '6rem' }}>
          <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Why Rochester?</h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { title: 'Zero-Cost Local Pickup', desc: 'Skip the $15 shipping fee. Pick up your parts safely in Brighton/Henrietta.' },
                { title: 'Same-Day Express', desc: 'Orders placed before 10 AM can often be picked up by COB for small parts.' },
                { title: 'Small Business Support', desc: 'We help local startups and inventors bridge the gap to production.' }
              ].map(item => (
                <li key={item.title}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'white' }}>{item.title}</div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>{item.desc}</div>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', flex: 1, background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Instant Quotes</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                Dont wait for an email response. Our automated engine calculates price and time instantly from your STL or 3MF.
              </p>
              <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Get Started</Link>
            </div>
          </div>
        </div>

        <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '3rem' }}>Local <span className="text-gradient">Capabilities</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Express Prototyping</h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>Need it now? Our Express Tier prioritizes your part on our fleet immediately.</p>
            </div>
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧱</div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Material Variety</h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>PLA, PETG, ABS, and TPU in stock locally for same-day start.</p>
            </div>
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌈</div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Multi-Color AMS</h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>Professional multi-material prints using Bambu Lab AMS technology.</p>
            </div>
          </div>
        </section>
      </div>

      <footer style={{ width: '100%', padding: '4rem 2rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © {new Date().getFullYear()} Flour City Prints · Rochester, NY · Serving Monroe and surrounding counties.
      </footer>
    </main>
  );
}
