import { NextRequest, NextResponse } from 'next/server';

type NotificationType = 'order' | 'message' | 'system' | 'delivery';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// In a real app, you'd use a database. For now, we'll use in-memory storage
let notifications: Notification[] = [];

export async function GET(): Promise<NextResponse<Notification[] | { error: string }>> {
  try {
    // Sort by timestamp, newest first
    const sortedNotifications = notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json(sortedNotifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<Notification | { error: string }>> {
  try {
    const body = await request.json() as Partial<CreateNotificationRequest>;
    const { type, title, message, actionUrl } = body;
    
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' }, 
        { status: 400 }
      );
    }
    
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actionUrl
    };
    
    notifications.push(notification);
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

interface UpdateNotificationRequest {
  id: string;
  read: boolean;
}

export async function PUT(
  request: NextRequest
): Promise<NextResponse<Notification | { error: string }>> {
  try {
    const body = await request.json() as Partial<UpdateNotificationRequest>;
    const { id, read } = body;
    
    if (id === undefined || read === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: id, read' }, 
        { status: 400 }
      );
    }
    
    const notificationIndex = notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    notifications[notificationIndex].read = read;
    
    return NextResponse.json(notifications[notificationIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

interface DeleteNotificationRequest {
  id: string;
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const body = await request.json() as Partial<DeleteNotificationRequest>;
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' }, 
        { status: 400 }
      );
    }
    
    notifications = notifications.filter(n => n.id !== id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}