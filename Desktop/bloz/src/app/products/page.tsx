"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

const products = [
  {
    name: "Ripe Plantain Chips",
    description: "Sweet, golden, and perfectly crunchy. Made from ripe plantains for a naturally sweet snack. Enjoy the authentic taste of Nigeria in every bite!",
    image: "/ripe-plantain.jpeg",
    price: "₦4,500",
    priceValue: 4500,
  },
  {
    name: "Unripe Plantain Chips",
    description: "Savory, green, and extra crispy. Made from unripe plantains for a classic, hearty crunch. Perfect for those who love a less sweet, more traditional flavor!",
    image: "/unripe-plantain.jpeg",
    price: "₦4,500",
    priceValue: 4500,
  },
];

type CartItem = {
  name: string;
  image: string;
  price: string;
  priceValue: number;
  quantity: number;
};

const CartIcon = ({ count, onClick }: { count: number; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-50 bg-black text-yellow-300 rounded-full shadow-lg w-16 h-16 flex items-center justify-center hover:bg-[#b6862c] hover:text-yellow-900 transition border-4 border-yellow-100"
    aria-label="View Cart"
    style={{ boxShadow: '0 4px 24px 0 rgba(255, 215, 0, 0.18)' }}
  >
    <FaShoppingCart className="text-4xl animate-bounce" />
    {count > 0 && (
      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">{count}</span>
    )}
  </button>
);

function CartModal({ cart, onClose, onRemove, onUpdateQty, onPay, phone, setPhone, phoneError }: {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (name: string) => void;
  onUpdateQty: (name: string, qty: number) => void;
  onPay: () => void;
  phone: string;
  setPhone: (v: string) => void;
  phoneError: string;
}) {
  const total = cart.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
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
            <>
              <span className="text-base">Review your order and proceed to payment.</span>
            </>
          )}
        </div>
        {cart.length > 0 && (
          <ul className="mb-4 divide-y divide-yellow-100 w-full">
            {cart.map((item) => (
              <li key={item.name} className="py-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-yellow-300 w-32 truncate">{item.name}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => onUpdateQty(item.name, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1 rounded bg-black/30 border border-yellow-200 text-yellow-50 text-center"
                />
                <span className="text-yellow-200 font-bold">₦{item.priceValue * item.quantity}</span>
                <button
                  className="ml-2 px-2 py-1 rounded bg-red-500 text-white hover:bg-red-700 text-xs font-bold"
                  onClick={() => onRemove(item.name)}
                  aria-label="Remove"
                >Remove</button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between items-center mt-4 mb-4 w-full">
          <span className="font-bold text-yellow-200">Total:</span>
          <span className="text-lg font-bold text-yellow-300">₦{total}</span>
        </div>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-yellow-200 text-yellow-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 mb-2"
          required
        />
        {phoneError && <div className="text-red-500 text-center font-bold mb-2">{phoneError}</div>}
        <button
          className="w-full py-3 rounded-full bg-yellow-300 text-yellow-900 font-bold text-lg shadow-lg hover:bg-yellow-400 transition mb-2 disabled:opacity-60"
          disabled={cart.length === 0}
          onClick={onPay}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<{ [name: string]: number }>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [addedModal, setAddedModal] = useState<{ name: string; price: string; quantity: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Cart persistence
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleQuantityChange = (name: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = (product: typeof products[0]) => {
    const quantity = quantities[product.name] || 1;
    setCart((prev) => {
      const existing = prev.find((item) => item.name === product.name);
      if (existing) {
        return prev.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            name: product.name,
            image: product.image,
            price: product.price,
            priceValue: product.priceValue,
            quantity,
          },
        ];
      }
    });
    setQuantities((prev) => ({ ...prev, [product.name]: 1 }));
    setAddedModal({ name: product.name, price: product.price, quantity });
    // Show toast message
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    if (product.name === "Ripe Plantain Chips") {
      setToast("Perfect for our gentlemen and ladies with sweet tooth!");
    } else if (product.name === "Unripe Plantain Chips") {
      setToast("A good choice for peeps who desire plain flavoury taste!");
    }
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  };

  const handleRemoveFromCart = (name: string) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  const handleUpdateCartQty = (name: string, qty: number) => {
    setCart((prev) => prev.map((item) => item.name === name ? { ...item, quantity: qty } : item));
  };

  const handlePay = async () => {
    if (!phone || phone.length < 7) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }
    setPhoneError("");
    // Send order to API
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: "Guest",
        phone,
        items: cart,
        status: "pending",
        date: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      setLastOrder(cart);
      setCart([]);
      setCartOpen(false);
      setShowSuccess(true);
      setPhone("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-16 px-4">
      <div className="w-full max-w-4xl flex items-center mb-8">
        <Link href="/" className="glass-card flex items-center gap-2 px-5 py-2 rounded-full shadow border border-yellow-200 text-yellow-300 font-bold hover:bg-[#b6862c] hover:text-yellow-900 transition">
          <FaArrowLeft className="text-lg" />
          Back to Home
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-10 text-yellow-800 drop-shadow" style={{ fontFamily: 'var(--font-brand)' }}>Our Products</h1>
      <div className="flex flex-col sm:flex-row gap-10 items-center justify-center w-full max-w-4xl">
        {products.map((product) => (
          <div key={product.name} className="glass-card w-80 h-auto flex flex-col items-center p-6 rounded-2xl shadow-lg border border-yellow-200 animate-fade-in-up">
            <div className="relative w-56 h-56 rounded-xl overflow-hidden mb-4 border border-yellow-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 text-yellow-300 text-center" style={{ fontFamily: 'var(--font-brand)' }}>{product.name}</h2>
            <p className="text-yellow-50 text-center mb-4 text-base leading-relaxed">{product.description}</p>
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-lg font-bold text-yellow-200">{product.price}</span>
              <div className="flex items-center gap-2">
                <label htmlFor={`qty-${product.name}`} className="text-yellow-50 text-sm">Qty:</label>
                <input
                  id={`qty-${product.name}`}
                  type="number"
                  min={1}
                  value={quantities[product.name] || 1}
                  onChange={e => handleQuantityChange(product.name, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1 rounded bg-black/40 border border-yellow-200 text-yellow-50 text-center"
                />
              </div>
            </div>
            <button
              className="mt-auto px-6 py-2 rounded-full bg-yellow-300 text-yellow-900 font-bold text-base shadow-lg hover:bg-yellow-400 transition"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <CartIcon count={cart.reduce((sum, item) => sum + item.quantity, 0)} onClick={() => setCartOpen(true)} />
      {cartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={handleRemoveFromCart}
          onUpdateQty={handleUpdateCartQty}
          onPay={handlePay}
          phone={phone}
          setPhone={setPhone}
          phoneError={phoneError}
        />
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card relative p-10 rounded-3xl shadow-2xl border border-yellow-200 flex flex-col items-center max-w-md w-full min-w-[320px]">
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-3xl text-yellow-200 hover:text-yellow-400 bg-black/30 rounded-full w-10 h-10 flex items-center justify-center border border-yellow-100 shadow"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-extrabold text-yellow-200 mb-2 text-center" style={{ fontFamily: 'var(--font-brand)' }}>Payment Successful!</h3>
            <div className="text-yellow-50 mb-4 text-center">
              <div className="font-bold text-lg text-yellow-300 mb-1">Thank you for your order!</div>
              <div className="text-yellow-100 text-base mb-2">Your order has been placed and will be processed soon.</div>
              <div className="mb-2">Order Summary:</div>
              <ul className="mb-2 divide-y divide-yellow-100">
                {lastOrder.map((item) => (
                  <li key={item.name} className="py-1 flex items-center justify-between">
                    <span className="font-semibold text-yellow-900">{item.name}</span>
                    <span className="text-yellow-700">x{item.quantity}</span>
                    <span className="text-yellow-700 font-bold">₦{item.priceValue * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="font-bold text-yellow-200 mt-2">
                Total: ₦{lastOrder.reduce((sum, item) => sum + item.priceValue * item.quantity, 0)}
              </div>
            </div>
            <button
              className="px-6 py-2 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 transition text-base min-w-[140px]"
              onClick={() => setShowSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {addedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card relative p-10 rounded-3xl shadow-2xl border border-yellow-200 flex flex-col items-center max-w-md w-full min-w-[320px]">
            <button
              onClick={() => setAddedModal(null)}
              className="absolute top-4 right-4 text-3xl text-yellow-200 hover:text-yellow-400 bg-black/30 rounded-full w-10 h-10 flex items-center justify-center border border-yellow-100 shadow"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-extrabold text-yellow-200 mb-2 text-center" style={{ fontFamily: 'var(--font-brand)' }}>Product Added to Cart!</h3>
            <div className="text-yellow-50 mb-4 text-center">
              <div className="font-bold text-lg text-yellow-300 mb-1">{addedModal.name}</div>
              <div className="text-yellow-200 text-base mb-1">Price: <span className="font-bold">{addedModal.price}</span></div>
              <div className="text-yellow-100 text-base">Quantity: <span className="font-bold">{addedModal.quantity}</span></div>
            </div>
            <div className="text-yellow-100 text-center mb-6">
              You can proceed to checkout or continue shopping to add more products.<br />
              <span className="text-yellow-300 font-semibold">Thank you for choosing Crunchy Cruise Snacks!</span>
            </div>
            <div className="flex gap-4 mt-2 w-full justify-center">
              <button
                className="px-6 py-2 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 transition text-base min-w-[140px]"
                onClick={() => {
                  setAddedModal(null);
                  setCartOpen(true);
                }}
              >
                Proceed to Checkout
              </button>
              <button
                className="px-6 py-2 rounded-full bg-black/70 text-yellow-300 border border-yellow-300 font-bold shadow hover:bg-yellow-900 transition text-base min-w-[140px]"
                onClick={() => setAddedModal(null)}
              >
                Add More
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast message */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-yellow-300 text-yellow-900 font-bold px-6 py-3 rounded-full shadow-lg border border-yellow-200 animate-toast-zoom-fade text-center text-base">
          {toast}
        </div>
      )}
    </div>
  );
} 