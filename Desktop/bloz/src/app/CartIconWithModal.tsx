"use client";
import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart, CartItem } from "./CartContext";
import Image from "next/image";

function CartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.quantity, 0);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2001] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card relative p-10 rounded-3xl shadow-2xl border border-yellow-200 flex flex-col items-center max-w-md w-full min-w-[320px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl text-yellow-200 hover:text-yellow-400 bg-black/30 rounded-full w-10 h-10 flex items-center justify-center border border-yellow-100 shadow"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-extrabold text-yellow-200 mb-2 text-center" style={{ fontFamily: 'var(--font-brand)' }}>Your Cart</h2>
        <div className="text-yellow-100 text-center mb-4">
          {cart.length === 0 ? (
            <span className="text-lg">Your cart is empty.</span>
          ) : (
            <span className="text-base">Review your order and proceed to checkout in the products page.</span>
          )}
        </div>
        <ul className="mb-4 divide-y divide-yellow-100 w-full">
          {cart.map((item) => (
            <li key={item.name} className="py-2 flex items-center justify-between gap-2">
              <span className="font-semibold text-yellow-300 w-32 truncate">{item.name}</span>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={e => updateQty(item.name, Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 px-2 py-1 rounded bg-black/30 border border-yellow-200 text-yellow-50 text-center"
              />
              <span className="text-yellow-200 font-bold">₦{parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.quantity}</span>
              <button
                className="ml-2 px-2 py-1 rounded bg-red-500 text-white hover:bg-red-700 text-xs font-bold"
                onClick={() => removeFromCart(item.name)}
                aria-label="Remove"
              >Remove</button>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center mt-4 mb-4 w-full">
          <span className="font-bold text-yellow-200">Total:</span>
          <span className="text-lg font-bold text-yellow-300">₦{total}</span>
        </div>
        <button
          className="w-full py-3 rounded-full bg-yellow-300 text-yellow-900 font-bold text-lg shadow-lg hover:bg-yellow-400 transition mb-2 disabled:opacity-60"
          disabled={cart.length === 0}
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}

export default function CartIconWithModal() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[2002] bg-black text-yellow-300 rounded-full shadow-lg w-16 h-16 flex items-center justify-center hover:bg-[#b6862c] hover:text-yellow-900 transition border-4 border-yellow-100"
        aria-label="View Cart"
        style={{ boxShadow: '0 4px 24px 0 rgba(255, 215, 0, 0.18)' }}
      >
        <FaShoppingCart className="text-4xl animate-bounce" />
        {count > 0 && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">{count}</span>
        )}
      </button>
      <CartModal open={open} onClose={() => setOpen(false)} />
    </>
  );
} 