// WebSocket server setup for real-time features
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initializeWebSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join admin room for admin-specific notifications
    socket.on('join-admin', () => {
      socket.join('admin');
      console.log('Admin joined:', socket.id);
    });

    // Join customer room for order updates
    socket.on('join-customer', (customerId: string) => {
      socket.join(`customer-${customerId}`);
      console.log('Customer joined:', customerId);
    });

    // Handle order tracking updates
    socket.on('track-order', (orderId: string) => {
      socket.join(`order-${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Emit real-time notifications
export const emitNotification = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

// Emit order updates
export const emitOrderUpdate = (orderId: string, update: any) => {
  if (io) {
    io.to(`order-${orderId}`).emit('order-update', update);
    io.to('admin').emit('order-status-change', { orderId, ...update });
  }
};

// Emit new order notification to admin
export const emitNewOrder = (orderData: any) => {
  if (io) {
    io.to('admin').emit('new-order', orderData);
  }
};

// Emit new message notification to admin
export const emitNewMessage = (messageData: any) => {
  if (io) {
    io.to('admin').emit('new-message', messageData);
  }
};

// Emit new feedback notification to admin
export const emitNewFeedback = (feedbackData: any) => {
  if (io) {
    io.to('admin').emit('new-feedback', feedbackData);
  }
};

export default io;