import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all messages
export async function GET() {
  const messages = await prisma.message.findMany();
  return NextResponse.json(messages);
}

// POST create a new message
export async function POST(req: NextRequest) {
  const data = await req.json();
  const message = await prisma.message.create({ data });
  return NextResponse.json(message, { status: 201 });
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