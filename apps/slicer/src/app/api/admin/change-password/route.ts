import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing currentPassword or newPassword' }, { status: 400 });
    }

    // 1. Get current pricing config
    let config = await prisma.pricingConfig.findFirst();

    // 2. Verify current password
    let isValid = false;
    if (config?.passwordHash) {
      isValid = await bcrypt.compare(currentPassword, config.passwordHash);
    } else {
      // Bootstrap: check against env var if no hash exists
      const expectedPassword = process.env.ADMIN_PASSWORD || 'password123';
      isValid = currentPassword === expectedPassword;
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
    }

    // 3. Hash new password
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    // 4. Update or create pricing config
    if (config) {
      await prisma.pricingConfig.update({
        where: { id: config.id },
        data: { passwordHash: newHash },
      });
    } else {
      // Create first config if it doesn't exist
      await prisma.pricingConfig.create({
        data: {
          passwordHash: newHash,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
