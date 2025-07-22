"use client";
import { useEffect, useRef, useState } from "react";

function getOrderCity(order: { city?: string; customer?: string; items?: { name?: string }[] }) {
  // Try to extract city from order.customer or order object (customize as needed)
  // For now, fallback to 'Nigeria' if not found
  return order.city || (order.customer && order.customer.split(" ").pop()) || "Nigeria";
}

export default function OrderNotification() {
  const [notification, setNotification] = useState<string | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    // On mount, get last seen order from localStorage
    lastOrderIdRef.current = localStorage.getItem("lastOrderId") || null;
    const poll = async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const orders = await res.json();
      if (!Array.isArray(orders) || orders.length === 0) return;
      const latest = orders[orders.length - 1];
      if (latest.id !== lastOrderIdRef.current) {
        // Show notification for new order
        const city = getOrderCity(latest);
        const product = latest.items && latest.items[0]?.name;
        setNotification(
          `Someone in ${city} just bought${product ? ` ${product}` : " something"}!`
        );
        lastOrderIdRef.current = latest.id;
        localStorage.setItem("lastOrderId", latest.id);
        setTimeout(() => setNotification(null), 6000);
      }
    };
    poll();
    const interval = setInterval(poll, 12000);
    return () => clearInterval(interval);
  }, []);

  if (!notification) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[2100] bg-[var(--brown)] text-yellow-900 font-bold px-8 py-4 rounded-full shadow-lg border border-[var(--brown)] animate-toast-zoom-fade text-lg text-center">
      {notification}
    </div>
  );
} 