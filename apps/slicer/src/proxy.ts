import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect dashboard and admin API routes
  // EXCLUDE login page and login API itself to prevent loops
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin');
  const isAuthRoute = pathname === '/dashboard/login' || pathname === '/api/admin/login';

  if (isProtectedPath && !isAuthRoute) {
    const sessionToken = req.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/dashboard/login', req.url);
      // Optional: Add redirect parameter for better UX
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // IMPORTANT: Validation of the sessionToken against Prisma HAPPENS 
    // inside the Dashboard Server Component (page.tsx) to avoid Edge Runtime panics.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};
