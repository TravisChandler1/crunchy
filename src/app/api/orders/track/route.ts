import { NextRequest, NextResponse } from 'next/server';

// Mock order tracking data - in real app, this would come from database
const mockOrders: any[] = [
  {
    id: 'ORD-123456',
    customer: 'John Doe',
    status: 'out_for_delivery',
    items: {
      items: [
        { name: 'Ripe Plantain Chips', quantity: 2, price: 4500 }
      ],
      total: 9000
    },
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    trackingUpdates: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        message: 'Order received and being processed',
        location: 'Crunchy Cruise Kitchen'
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        message: 'Order confirmed and payment verified',
        location: 'Crunchy Cruise Kitchen'
      },
      {
        status: 'preparing',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        message: 'Your delicious chips are being prepared',
        location: 'Crunchy Cruise Kitchen'
      },
      {
        status: 'ready',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        message: 'Order ready for delivery',
        location: 'Crunchy Cruise Kitchen'
      },
      {
        status: 'out_for_delivery',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        message: 'Order is on the way to your location',
        location: 'En route to delivery address'
      }
    ],
    deliveryAddress: '123 Sample Street, Lagos, Nigeria',
    phone: '+2348012345678'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');
    
    if (!ref) {
      return NextResponse.json({ error: 'Order reference is required' }, { status: 400 });
    }
    
    // Find order by reference
    const order = mockOrders.find(o => o.id === ref);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, message, location } = body;
    
    // Find order and add tracking update
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const trackingUpdate = {
      status,
      timestamp: new Date(),
      message,
      location
    };
    
    mockOrders[orderIndex].status = status;
    mockOrders[orderIndex].trackingUpdates.push(trackingUpdate);
    
    // Create notification for customer
    const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order',
        title: 'Order Update',
        message: `Your order ${orderId} is now ${status.replace('_', ' ')}`,
        actionUrl: `/track?ref=${orderId}`
      })
    });
    
    return NextResponse.json(mockOrders[orderIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order tracking' }, { status: 500 });
  }
}