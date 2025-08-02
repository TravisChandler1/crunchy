"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTruck, FaBox } from "react-icons/fa";

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

type Order = {
  id: string;
  customer: string;
  status: OrderStatus;
  items: any;
  total: number;
  estimatedDelivery?: string;
  trackingUpdates: {
    status: OrderStatus;
    timestamp: Date;
    message: string;
    location?: string;
  }[];
  deliveryAddress?: string;
  phone: string;
};

const statusConfig = {
  pending: { icon: FaClock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Order Received' },
  confirmed: { icon: FaCheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed' },
  preparing: { icon: FaBox, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Preparing' },
  ready: { icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Ready for Pickup/Delivery' },
  out_for_delivery: { icon: FaTruck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Out for Delivery' },
  delivered: { icon: FaCheckCircle, color: 'text-green-700', bg: 'bg-green-200', label: 'Delivered' },
  cancelled: { icon: FaClock, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' }
};

export default function OrderTracker() {
  const [orderRef, setOrderRef] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackOrder = async () => {
    if (!orderRef.trim()) {
      setError('Please enter an order reference');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/orders/track?ref=${orderRef}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        setError('Order not found. Please check your reference number.');
        setOrder(null);
      }
    } catch (err) {
      setError('Failed to track order. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (currentStatus: OrderStatus) => {
    const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    const currentIndex = statuses.indexOf(currentStatus);
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#45523e] mb-6 text-center">Track Your Order</h2>
      
      {/* Search Section */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            placeholder="Enter your order reference (e.g., ORD-123456)"
            className="flex-1 px-4 py-3 border border-[#7ed957] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ed957] text-[#45523e]"
            onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
          />
          <button
            onClick={trackOrder}
            disabled={loading}
            className="px-6 py-3 bg-[#7ed957] text-white rounded-lg hover:bg-[#45523e] transition disabled:opacity-50 flex items-center gap-2"
          >
            <FaSearch />
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Order Details */}
      {order && (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="bg-[#7ed957] text-white p-4 rounded-lg">
            <h3 className="text-lg font-bold">Order #{order.id}</h3>
            <p>Customer: {order.customer}</p>
            <p>Total: ₦{order.total.toLocaleString()}</p>
            {order.estimatedDelivery && (
              <p>Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleString()}</p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#7ed957] h-2 rounded-full transition-all duration-500"
                style={{ width: `${getStatusProgress(order.status)}%` }}
              />
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            {(() => {
              const config = statusConfig[order.status];
              const Icon = config.icon;
              return (
                <>
                  <div className={`p-3 rounded-full ${config.bg}`}>
                    <Icon className={`text-xl ${config.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#45523e]">{config.label}</h4>
                    <p className="text-gray-600 text-sm">
                      {order.status === 'delivered' ? 'Your order has been delivered!' :
                       order.status === 'out_for_delivery' ? 'Your order is on the way!' :
                       order.status === 'ready' ? 'Your order is ready!' :
                       order.status === 'preparing' ? 'We\'re preparing your delicious chips!' :
                       order.status === 'confirmed' ? 'Your order has been confirmed!' :
                       'We\'ve received your order!'}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <FaMapMarkerAlt className="text-[#7ed957] mt-1" />
              <div>
                <h4 className="font-semibold text-[#45523e]">Delivery Address</h4>
                <p className="text-gray-600">{order.deliveryAddress}</p>
              </div>
            </div>
          )}

          {/* Tracking Updates */}
          <div>
            <h4 className="font-bold text-[#45523e] mb-3">Tracking Updates</h4>
            <div className="space-y-3">
              {order.trackingUpdates.map((update, index) => {
                const config = statusConfig[update.status];
                const Icon = config.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 border-l-4 border-[#7ed957] bg-gray-50">
                    <div className={`p-2 rounded-full ${config.bg} mt-1`}>
                      <Icon className={`text-sm ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#45523e]">{update.message}</p>
                      {update.location && (
                        <p className="text-sm text-gray-600">📍 {update.location}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(update.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
            <p className="text-blue-700 text-sm mb-3">
              If you have any questions about your order, feel free to contact us.
            </p>
            <div className="flex gap-2">
              <a 
                href={`tel:${order.phone}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
              >
                Call Support
              </a>
              <a 
                href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=Hi, I need help with my order ${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}