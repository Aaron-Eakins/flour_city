import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import QuoteTable from './QuoteTable';
import ConfigForm from './ConfigForm';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Session Validation (Edge-safe alternative to Middleware DB check)
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    redirect('/dashboard/login');
  }

  const session = await prisma.adminSession.findUnique({
    where: { 
      token: sessionToken,
      expiresAt: { gt: new Date() }
    },
  });

  if (!session) {
    // If token exists but is invalid/expired, redirect to login
    redirect('/dashboard/login');
  }

  // 2. Fetch Dashboard Content
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const config = await prisma.pricingConfig.findFirst();
  const [materials, qualities, infillOptions, nozzleDiameters] = await Promise.all([
    prisma.material.findMany({ orderBy: { name: 'asc' } }),
    prisma.quality.findMany({ orderBy: { name: 'asc' } }),
    prisma.infillOption.findMany({ orderBy: { value: 'asc' } }),
    prisma.nozzleDiameter.findMany({ orderBy: { diameter: 'asc' } }),
  ]);



  const serializedQuotes = quotes.map(q => ({
    id: q.id,
    fileName: q.fileName,
    totalCost: q.totalCost,
    status: q.status,
    customerEmail: q.customerEmail,
    createdAt: q.createdAt.toISOString(),
  }));

  const metrics = {
    totalRevenue: quotes.filter(q => ['PAID', 'PRINTING', 'SHIPPED'].includes(q.status)).reduce((acc, q) => acc + q.totalCost, 0),
    activeOrders: quotes.filter(q => q.status === 'PAID' || q.status === 'PRINTING').length,
    totalQuotes: quotes.length
  };

  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', background: 'var(--background)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Flour City Dashboard</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
              Strategic oversight and production management.
            </p>
          </div>
          <a href="/" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>Back to Site</a>
        </div>

        <ConfigForm 
          initialConfig={config} 
          initialMaterials={materials}
          initialQualities={qualities}
          initialInfills={infillOptions}
          initialNozzles={nozzleDiameters}
        />




        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Total Revenue</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0', color: 'var(--success)' }}>
              ${metrics.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Active Orders</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0', color: 'var(--primary)' }}>
              {metrics.activeOrders}
            </p>
          </div>
          <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Total Quotes</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>
              {metrics.totalQuotes}
            </p>
          </div>
        </div>

        <QuoteTable initialQuotes={serializedQuotes} />
      </div>
    </main>
  );
}
