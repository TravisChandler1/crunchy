import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/utils/email';

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

  // Send order confirmation email to customer
  await sendEmail({
    to: data.email,
    subject: 'Your Order Confirmation - Crunchy Plantain Chips',
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order ID: ${order.id}</p>
      <p><strong>Shipping Details:</strong></p>
      <p>Name: ${data.name}</p>
      <p>Address: ${data.address}</p>
      <p>Phone: ${data.phone}</p>
      <p><strong>Order Details:</strong></p>
      <ul>
        ${data.items.map((item: any) => `
          <li>${item.name} x ${item.quantity} - ₦${item.price * item.quantity}</li>
        `).join('')}
      </ul>
      <p><strong>Total Amount:</strong> ₦${data.total}</p>
      <p>We'll process your order soon!</p>
    `
  });

  // Send notification to admin
  await sendEmail({
    to: process.env.EMAIL_USER!,
    subject: 'New Order Received',
    html: `
      <h2>New Order #${order.id}</h2>
      <p><strong>Customer Details:</strong></p>
      <p>Name: ${data.name}</p>
      <p>Email: ${data.email}</p>
      <p>Phone: ${data.phone}</p>
      <p>Address: ${data.address}</p>
      <p><strong>Order Details:</strong></p>
      <ul>
        ${data.items.map((item: any) => `
          <li>${item.name} x ${item.quantity} - ₦${item.price * item.quantity}</li>
        `).join('')}
      </ul>
      <p><strong>Total Amount:</strong> ₦${data.total}</p>
    `
  });

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