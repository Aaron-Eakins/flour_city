import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // These paths are always public (login page + login API)
  if (pathname === '/dashboard/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // Protect dashboard and admin API routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin')) {
    const session = req.cookies.get('admin_session')?.value;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'password123';

    if (session !== expectedPassword) {
      // Redirect to login for page requests, 401 for API calls
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/dashboard/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};
