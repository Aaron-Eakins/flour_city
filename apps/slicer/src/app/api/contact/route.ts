import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, companyName, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        companyName,
        email,
        subject: subject || 'General Inquiry',
        message,
        status: 'UNREAD',
      },
    });

    // Optional: Integrate Resend here if the user wanted email notifications
    // if (process.env.RESEND_API_KEY) { ... }

    return NextResponse.json({ success: true, messageId: newMessage.id });
  } catch (error: any) {
    console.error('Contact Form Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
