"use client";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "./CartContext";

function CartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [payEmail, setPayEmail] = useState("");
  const [payName, setPayName] = useState("");
  const [payError, setPayError] = useState("");
  const [payPhone, setPayPhone] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<null | { success: boolean; message: string }>(null);
  const total = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.quantity, 0);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePaystack = () => {
    if (!payName || payName.trim().length < 2) {
      setPayError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!payEmail || !validateEmail(payEmail)) {
      setPayError("Please enter a valid email address.");
      return;
    }
    if (!payPhone || payPhone.trim().length < 7) {
      setPayError("Please enter a valid phone number.");
      return;
    }
    setPayError("");
    import("@paystack/inline-js").then(({ default: PaystackPop }) => {
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxx",
        email: payEmail,
        amount: total * 100,
        onSuccess: async (transaction: { reference: string }) => {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: transaction.reference }),
          });
          const data = await res.json();
          setShowPayment(false);
          if (data.success) {
            clearCart();
            setTransactionStatus({ success: true, message: `Payment verified! Reference: ${transaction.reference}` });
          } else {
            setTransactionStatus({ success: false, message: "Payment could not be verified. Please contact support." });
          }
        },
        onCancel: () => {
          setShowPayment(false);
          setTransactionStatus({ success: false, message: "Payment cancelled" });
        },
        metadata: {
          custom_fields: [
            { display_name: "Name", variable_name: "name", value: payName },
            { display_name: "Phone", variable_name: "phone", value: payPhone }
          ]
        }
      });
    });
  };

  // Automatically hide transaction status popup after 4 seconds
  useEffect(() => {
    if (transactionStatus) {
      const timer = setTimeout(() => setTransactionStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [transactionStatus]);

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[2001] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="glass-card relative p-10 rounded-3xl shadow-2xl border border-[#7ed957] flex flex-col items-center max-w-md w-full min-w-[320px]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-3xl text-[#7ed957] hover:text-[#45523e] bg-black/30 rounded-full w-10 h-10 flex items-center justify-center border border-[#7ed957] shadow"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-extrabold text-[#7ed957] mb-2 text-center" style={{ fontFamily: 'var(--font-brand)' }}>Your Cart</h2>
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
                <span className="font-semibold text-[#7ed957] w-32 truncate">{item.name}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateQty(item.name, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1 rounded bg-black/30 border border-[#7ed957] text-yellow-50 text-center"
                />
                <span className="text-[#7ed957] font-bold">₦{parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.quantity}</span>
                <button
                  className="ml-2 px-2 py-1 rounded bg-red-500 text-white hover:bg-red-700 text-xs font-bold"
                  onClick={() => removeFromCart(item.name)}
                  aria-label="Remove"
                >Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mt-4 mb-4 w-full">
            <span className="font-bold text-[#7ed957]">Total:</span>
            <span className="text-lg font-bold text-[#7ed957]">₦{total}</span>
          </div>
          <button
            className="w-full py-3 rounded-full bg-[#7ed957] text-[#45523e] font-bold text-lg shadow-lg hover:bg-[#45523e] hover:text-white transition mb-2 disabled:opacity-60"
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}
          >
            Checkout
          </button>
          <button
            className="w-full py-3 rounded-full bg-[#7ed957] text-[#45523e] font-bold text-lg shadow-lg hover:bg-[#45523e] hover:text-white transition mb-2 disabled:opacity-60"
            disabled={cart.length === 0}
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>
      </div>
      {showPayment && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-card pt-16 pb-16 px-8 rounded-3xl shadow-2xl border border-[#7ed957] flex flex-col items-center max-w-md w-full min-w-[320px] relative">
            <button
              onClick={() => setShowPayment(false)}
              className="absolute top-4 right-4 text-3xl text-[#7ed957] hover:text-[#45523e] bg-black/30 rounded-full w-10 h-10 flex items-center justify-center border border-[#7ed957] shadow"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-[#7ed957] text-center">Pay with Paystack</h3>
            <div className="w-full flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Your Name"
                value={payName}
                onChange={e => setPayName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#7ed957] text-[#45523e] bg-white focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={payEmail}
                onChange={e => setPayEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#7ed957] text-[#45523e] bg-white focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
              />
              <input
                type="tel"
                placeholder="Your Phone Number"
                value={payPhone}
                onChange={e => setPayPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#7ed957] text-[#45523e] bg-white focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
              />
            </div>
            {payError && <div className="text-red-500 text-center font-bold mb-2">{payError}</div>}
            <button
              className="w-full py-3 rounded-full bg-[#7ed957] text-[#45523e] font-bold text-lg shadow-lg hover:bg-[#45523e] hover:text-white transition mb-4 disabled:opacity-60"
              onClick={handlePaystack}
              disabled={cart.length === 0 || !payEmail || !payName || payName.trim().length < 2 || !validateEmail(payEmail) || !payPhone || payPhone.trim().length < 7}
            >
              Pay Now
            </button>
            <button
              className="w-full py-3 rounded-full bg-black/40 text-[#7ed957] font-bold text-lg shadow-lg hover:bg-[#7ed957] hover:text-white transition"
              onClick={() => setShowPayment(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {transactionStatus && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`glass-card px-8 py-6 rounded-3xl shadow-2xl border ${
            transactionStatus.success ? "border-[#7ed957]" : "border-red-500"
          } flex flex-col items-center min-w-[300px] max-w-[400px]`}>
            <div className={`text-xl font-bold ${
              transactionStatus.success ? "text-white" : "text-red-500"
            } text-center`}>
              {transactionStatus.message}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CartIconWithModal() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-global-cart-modal', handler);
    return () => window.removeEventListener('open-global-cart-modal', handler);
  }, []);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[2002] bg-[#7ed957] text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:bg-[#45523e] hover:text-white transition border-4 border-[#7ed957]"
        aria-label="View Cart"
        style={{ boxShadow: '0 4px 24px 0 rgba(194,168,107,0.18)' }}
      >
        <FaShoppingCart className="text-2xl text-white" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{count}</span>
        )}
      </button>
      <CartModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}