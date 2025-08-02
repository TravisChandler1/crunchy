"use client";
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinAdminRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('join-admin');
    }
  };

  const joinCustomerRoom = (customerId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-customer', customerId);
    }
  };

  const trackOrder = (orderId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('track-order', orderId);
    }
  };

  const onOrderUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('order-update', callback);
    }
  };

  const onNewOrder = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-order', callback);
    }
  };

  const onNewMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
    }
  };

  const onNewFeedback = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-feedback', callback);
    }
  };

  const offAllListeners = () => {
    if (socketRef.current) {
      socketRef.current.off();
    }
  };

  return {
    socket: socketRef.current,
    joinAdminRoom,
    joinCustomerRoom,
    trackOrder,
    onOrderUpdate,
    onNewOrder,
    onNewMessage,
    onNewFeedback,
    offAllListeners
  };
};