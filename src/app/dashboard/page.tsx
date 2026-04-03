import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import DashboardClient from './DashboardClient';

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
  const [materials, qualities, infillOptions, nozzleDiameters, messages] = await Promise.all([
    prisma.material.findMany({ orderBy: { name: 'asc' } }),
    prisma.quality.findMany({ orderBy: { name: 'asc' } }),
    prisma.infillOption.findMany({ orderBy: { value: 'asc' } }),
    prisma.nozzleDiameter.findMany({ orderBy: { diameter: 'asc' } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  const serializedQuotes = quotes.map((q: any) => ({
    id: q.id,
    fileName: q.fileName,
    totalCost: q.totalCost,
    status: q.status,
    customerEmail: q.customerEmail,
    createdAt: q.createdAt.toISOString(),
    weightGrams: q.weightGrams,
    blobUrl: q.blobUrl
  }));

  const serializedMessages = messages.map((m: any) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', background: 'var(--background)' }}>
      <DashboardClient 
        initialQuotes={serializedQuotes}
        initialConfig={config}
        initialMaterials={materials.map((m: any) => ({ ...m, createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString() }))}
        initialQualities={qualities}
        initialInfills={infillOptions}
        initialNozzles={nozzleDiameters}
        initialMessages={serializedMessages}
      />
    </main>
  );
}
