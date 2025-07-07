import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all products
export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

// POST create a new product
export async function POST(req: NextRequest) {
  const data = await req.json();
  // Ensure 'available' is set, default to true if not provided
  const product = await prisma.product.create({ data: { ...data, available: data.available ?? true } });
  return NextResponse.json(product, { status: 201 });
}

// PUT update a product by ID
export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

// DELETE a product by ID
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 