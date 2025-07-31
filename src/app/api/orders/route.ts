import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/utils/email';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  delivery?: {
    isDelivery: boolean;
    address: string;
    coordinates: { lat: number; lng: number } | null;
    deliveryCharge: number;
  };
}

const prisma = new PrismaClient();

// GET all orders
export async function GET() {
  const orders = await prisma.order.findMany();
  return NextResponse.json(orders);
}

// POST create a new order
export async function POST(req: NextRequest) {
  const requestData = await req.json() as OrderData;
  const orderData = {
    customer: requestData.customer,
    phone: requestData.phone,
    items: JSON.stringify({
      items: requestData.items,
      total: requestData.total,
      email: requestData.email,
      address: requestData.address,
      delivery: requestData.delivery
    })
  };

  const order = await prisma.order.create({ data: orderData });
  const parsedItems = JSON.parse(order.items as string);

  const deliveryInfo = parsedItems.delivery;
  const deliveryText = deliveryInfo?.isDelivery 
    ? `<p><strong>Delivery Address:</strong> ${deliveryInfo.address}</p><p><strong>Delivery Charge:</strong> ₦${deliveryInfo.deliveryCharge}</p>`
    : '<p><strong>Pickup:</strong> Customer will pickup from store</p>';

  // Send order confirmation email to customer
  await sendEmail({
    to: parsedItems.email,
    subject: 'Your Order Confirmation - Crunchy Plantain Chips',
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order ID: ${order.id}</p>
      <p><strong>Customer Details:</strong></p>
      <p>Name: ${requestData.customer}</p>
      <p>Phone: ${order.phone}</p>
      ${deliveryText}
      <p><strong>Order Details:</strong></p>
      <ul>
        ${parsedItems.items.map((item: OrderItem) => `
          <li>${item.name} x ${item.quantity} - ₦${item.price * item.quantity}</li>
        `).join('')}
      </ul>
      <p><strong>Total Amount:</strong> ₦${parsedItems.total}</p>
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
      <p>Name: ${requestData.customer}</p>
      <p>Email: ${parsedItems.email}</p>
      <p>Phone: ${order.phone}</p>
      ${deliveryText}
      <p><strong>Order Details:</strong></p>
      <ul>
        ${parsedItems.items.map((item: OrderItem) => `
          <li>${item.name} x ${item.quantity} - ₦${item.price * item.quantity}</li>
        `).join('')}
      </ul>
      <p><strong>Total Amount:</strong> ₦${parsedItems.total}</p>
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