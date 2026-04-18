import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  // 1. Get current pricing config to find passwordHash
  const config = await prisma.pricingConfig.findFirst();
  
  let isValid = false;

  if (config?.passwordHash) {
    // Compare against stored hash
    isValid = await bcrypt.compare(password, config.passwordHash);
  } else {
    // Bootstrap: compare against env var if no hash exists yet
    const expectedPassword = process.env.ADMIN_PASSWORD || 'password123';
    isValid = password === expectedPassword;
    
    if (isValid) {
      console.warn('Bootstrap login successful. Please change your password in the dashboard.');
    }
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // 2. Generate random session token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8); // 8 hours

  // 3. Store session in DB
  try {
    await prisma.adminSession.create({
      data: {
        token,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: 'Session creation failed' }, { status: 500 });
  }

  // 4. Set cookie
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
  });

  return NextResponse.json({ ok: true });
}
