"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  name: string;
  image: string;
  price: string;
  quantity: number;
};

export type DeliveryInfo = {
  isDelivery: boolean;
  address: string;
  coordinates: { lat: number; lng: number } | null;
  distance: number | null;
  deliveryCharge: number;
};

type CartContextType = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (name: string) => void;
  updateQty: (name: string, qty: number) => void;
  clearCart: () => void;
  deliveryInfo: DeliveryInfo;
  setDeliveryInfo: React.Dispatch<React.SetStateAction<DeliveryInfo>>;
  calculateDeliveryCharge: (distance: number) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    isDelivery: false,
    address: "",
    coordinates: null,
    distance: null,
    deliveryCharge: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        return [...prev, item];
      }
    });
  };
  const removeFromCart = (name: string) => setCart((prev) => prev.filter((i) => i.name !== name));
  const updateQty = (name: string, qty: number) => setCart((prev) => prev.map((i) => i.name === name ? { ...i, quantity: qty } : i));
  const clearCart = () => {
    setCart([]);
    setDeliveryInfo({
      isDelivery: false,
      address: "",
      coordinates: null,
      distance: null,
      deliveryCharge: 0,
    });
  };

  const calculateDeliveryCharge = (distance: number): number => {
    if (distance <= 2.5) return 2000;
    if (distance <= 5) return 3000;
    if (distance <= 10) return 4000;
    if (distance <= 20) return 5000;
    return 5000; // For distances over 20km, use the highest tier
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      setCart, 
      addToCart, 
      removeFromCart, 
      updateQty, 
      clearCart,
      deliveryInfo,
      setDeliveryInfo,
      calculateDeliveryCharge
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
} 