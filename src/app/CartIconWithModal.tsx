"use client";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "./CartContext";
import DeliverySelector from "./DeliverySelector";

function CartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQty, clearCart, deliveryInfo } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [payEmail, setPayEmail] = useState("");
  const [payName, setPayName] = useState("");
  const [payError, setPayError] = useState("");
  const [payPhone, setPayPhone] = useState("");
  
  const subtotal = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.quantity, 0);
  const total = subtotal + deliveryInfo.deliveryCharge;

  const handleDeliveryChange = (hasDelivery: boolean, charge: number) => {
    // This function is no longer needed since DeliverySelector updates the context directly
  };

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
    // Dynamically import PaystackPop only on the client
    import("@paystack/inline-js").then(({ default: PaystackPop }) => {
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxx", // TODO: Replace with your real public key
        email: payEmail,
        amount: total * 100,
        onSuccess: async (transaction: { reference: string }) => {
          // Call your server to verify
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: transaction.reference }),
          });
          const data = await res.json();
          if (data.success) {
            // Create order after successful payment
            const orderData = {
              customer: payName,
              email: payEmail,
              phone: payPhone,
              address: deliveryInfo.isDelivery ? deliveryInfo.address : "Store Pickup",
              items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: parseInt(item.price.replace(/[^\d]/g, ""), 10)
              })),
              total: total,
              delivery: deliveryInfo.isDelivery ? {
                isDelivery: true,
                address: deliveryInfo.address,
                coordinates: deliveryInfo.coordinates,
                deliveryCharge: deliveryInfo.deliveryCharge
              } : {
                isDelivery: false,
                address: "",
                coordinates: null,
                deliveryCharge: 0
              }
            };

            try {
              const orderRes = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
              });
              
              if (orderRes.ok) {
                setShowPayment(false);
                clearCart();
                alert(`Payment verified and order created! Reference: ${transaction.reference}`);
              } else {
                alert("Payment verified but failed to create order. Please contact support.");
              }
            } catch (error) {
              console.error("Error creating order:", error);
              alert("Payment verified but failed to create order. Please contact support.");
            }
          } else {
            alert("Payment could not be verified. Please contact support.");
          }
        },
        onCancel: () => {
          alert("Payment cancelled");
        },
        metadata: {
          custom_fields: [
            { display_name: "Name", variable_name: "name", value: payName },
            { display_name: "Phone", variable_name: "phone", value: payPhone },
            { display_name: "Delivery", variable_name: "delivery", value: deliveryInfo.isDelivery ? "Yes" : "No" },
            ...(deliveryInfo.isDelivery ? [
              { display_name: "Delivery Address", variable_name: "delivery_address", value: deliveryInfo.address },
              { display_name: "Delivery Charge", variable_name: "delivery_charge", value: `₦${deliveryInfo.deliveryCharge}` }
            ] : [])
          ]
        }
      });
    });
  };

  if (!open) return null;
  return (
    <>
    <div className="fixed inset-0 z-[2001] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="glass-card relative p-6 rounded-3xl shadow-2xl border border-[#7ed957] flex flex-col items-center max-w-md w-full min-w-[320px] max-h-[90vh] overflow-y-auto">
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
        
        {cart.length > 0 && (
          <div className="w-full">
            <DeliverySelector onDeliveryChange={handleDeliveryChange} />
          </div>
        )}

        <div className="w-full space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-yellow-100">Subtotal:</span>
            <span className="text-[#7ed957] font-bold">₦{subtotal}</span>
          </div>
          {deliveryInfo.deliveryCharge > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-yellow-100">Delivery:</span>
              <span className="text-[#7ed957] font-bold">₦{deliveryInfo.deliveryCharge}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-[#7ed957]">
            <span className="font-bold text-[#7ed957]">Total:</span>
            <span className="text-lg font-bold text-[#7ed957]">₦{total}</span>
          </div>
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
          <div className="glass-card p-8 rounded-3xl shadow-2xl border border-[#7ed957] flex flex-col items-center max-w-md w-full min-w-[320px] relative">
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