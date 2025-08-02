import { NextRequest, NextResponse } from 'next/server';

// This would connect to your database in a real app
let feedbacks: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackId, helpful } = body;
    
    // Find feedback and update helpful count
    const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    
    if (helpful) {
      feedbacks[feedbackIndex].helpful += 1;
    }
    // Note: In a real app, you'd track who voted to prevent duplicate votes
    
    return NextResponse.json(feedbacks[feedbackIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}