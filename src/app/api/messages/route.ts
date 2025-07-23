import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/utils/email';

const prisma = new PrismaClient();

// GET all messages
export async function GET() {
  const messages = await prisma.message.findMany();
  return NextResponse.json(messages);
}

// POST create a new message
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received message data:', data);

    const message = await prisma.message.create({ data });
    console.log('Message saved to database:', message);
    
    // Send email to admin
    console.log('Attempting to send email to:', process.env.EMAIL_USER);
    const emailResult = await sendEmail({
      to: process.env.EMAIL_USER!,
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Message from ${data.name}</h2>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `
    });
    
    if (emailResult) {
      console.log('Email sent successfully');
    } else {
      console.error('Failed to send email');
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

// PUT update a message by ID
export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
  const message = await prisma.message.update({ where: { id }, data });
  return NextResponse.json(message);
}

// DELETE a message by ID
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
  await prisma.message.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 