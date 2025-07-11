import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all testimonials
export async function GET() {
  const testimonials = await prisma.testimonial.findMany();
  return NextResponse.json(testimonials);
}

// POST create a new testimonial
export async function POST(req: NextRequest) {
  const data = await req.json();
  const testimonial = await prisma.testimonial.create({ data });
  return NextResponse.json(testimonial, { status: 201 });
}

// PUT update a testimonial by ID
export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 });
  const testimonial = await prisma.testimonial.update({ where: { id }, data });
  return NextResponse.json(testimonial);
}

// DELETE a testimonial by ID
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 });
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 