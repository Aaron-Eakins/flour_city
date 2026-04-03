import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect dashboard and admin API routes (excluding the login page and login API)
  if (
    (pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin')) &&
    pathname !== '/dashboard/login' &&
    pathname !== '/api/admin/login'
  ) {
    const sessionToken = req.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return unauthorized(req, pathname);
    }

    try {
      // Validate session token in DB
      const session = await prisma.adminSession.findUnique({
        where: { 
          token: sessionToken,
          expiresAt: { gt: new Date() }
        },
      });

      if (!session) {
        return unauthorized(req, pathname);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      return unauthorized(req, pathname);
    }
  }

  return NextResponse.next();
}

function unauthorized(req: NextRequest, pathname: string) {
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const loginUrl = new URL('/dashboard/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};

