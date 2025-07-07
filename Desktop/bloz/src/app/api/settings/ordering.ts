import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Return orderingEnabled flag
export async function GET() {
  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 1, orderingEnabled: true } });
  }
  return NextResponse.json({ orderingEnabled: settings.orderingEnabled });
}

// POST: Set orderingEnabled flag
export async function POST(req: NextRequest) {
  const { orderingEnabled } = await req.json();
  if (typeof orderingEnabled !== 'boolean') {
    return NextResponse.json({ error: 'orderingEnabled must be boolean' }, { status: 400 });
  }
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: { orderingEnabled },
    create: { id: 1, orderingEnabled },
  });
  return NextResponse.json({ orderingEnabled: settings.orderingEnabled });
} 