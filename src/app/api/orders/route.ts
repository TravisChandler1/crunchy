import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all orders
export async function GET() {
  const orders = await prisma.order.findMany();
  return NextResponse.json(orders);
}

// POST create a new order
export async function POST(req: NextRequest) {
  const data = await req.json();
  const order = await prisma.order.create({ data });
  return NextResponse.json(order, { status: 201 });
}

// PUT update an order by ID
export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json(order);
}

// DELETE an order by ID
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  try {
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string" &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
} 