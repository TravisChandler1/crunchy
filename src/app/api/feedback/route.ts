import { NextRequest, NextResponse } from 'next/server';

// In a real app, you'd use a database
let feedbacks: any[] = [];

export async function GET() {
  try {
    // Sort by timestamp, newest first
    const sortedFeedbacks = feedbacks.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json(sortedFeedbacks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerName, rating, comment, category } = body;
    
    // Check if order exists and verify customer (in real app)
    const verified = orderId ? true : false; // Simplified verification
    
    const feedback = {
      id: Date.now().toString(),
      orderId,
      customerName,
      rating,
      comment,
      category,
      helpful: 0,
      timestamp: new Date(),
      verified
    };
    
    feedbacks.push(feedback);
    
    // Create notification for admin
    const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'message',
        title: 'New Customer Feedback',
        message: `${customerName} left a ${rating}-star review for ${category}`,
        actionUrl: '/admin#feedback'
      })
    });
    
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}