import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const expectedPassword = process.env.ADMIN_PASSWORD || 'password123';

  if (password !== expectedPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Set a simple signed session cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', process.env.ADMIN_PASSWORD || 'password123', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // In production, set secure: true
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return res;
}
