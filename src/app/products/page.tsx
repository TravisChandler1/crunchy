"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { useCart } from "../CartContext";

type CartItem = {
  name: string;
  image: string;
  price: string;
  quantity: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  available: boolean;
};

function CartModal({ cart, onClose, onRemove, onUpdateQty, onPay, phone, setPhone, phoneError, name, setName, nameError }: {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (name: string) => void;
  onUpdateQty: (name: string, qty: number) => void;
  onPay: () => void;
  phone: string;
  setPhone: (v: string) => void;
  phoneError: string;
  name: string;
  setName: (v: string) => void;
  nameError: string;
}) {
  const total = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.quantity, 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
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
            <>
              <span className="text-base">Review your order and proceed to payment.</span>
            </>
          )}
        </div>
        {cart.length > 0 && (
          <ul className="mb-4 divide-y divide-yellow-100 w-full">
            {cart.map((item) => (
              <li key={item.name} className="py-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-[#7ed957] w-32 truncate">{item.name}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => onUpdateQty(item.name, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1 rounded bg-black/30 border border-[#7ed957] text-yellow-50 text-center"
                />
                <span className="text-[#7ed957] font-bold">₦{parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.quantity}</span>
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
          <span className="font-bold text-[#7ed957]">Total:</span>
          <span className="text-lg font-bold text-[#7ed957]">₦{total}</span>
        </div>
        <button
          className="w-full py-3 rounded-full bg-[#7ed957] text-[#45523e] font-bold text-lg shadow-lg hover:bg-[#45523e] hover:text-white transition mb-2 disabled:opacity-60"
          disabled={cart.length === 0}
          onClick={onPay}
        >
          Checkout
        </button>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-[#7ed957] text-yellow-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7ed957] mb-2"
          required
        />
        {nameError && <div className="text-red-500 text-center font-bold mb-2">{nameError}</div>}
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-[#7ed957] text-yellow-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7ed957] mb-2"
          required
        />
        {phoneError && <div className="text-red-500 text-center font-bold mb-2">{phoneError}</div>}
        <button
          className="w-full py-3 rounded-full bg-[#7ed957] text-[#45523e] font-bold text-lg shadow-lg hover:bg-[#45523e] hover:text-white transition mb-2 disabled:opacity-60"
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
  const { cart, addToCart, removeFromCart, updateQty, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [name: string]: number }>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [addedModal, setAddedModal] = useState<{ name: string; price: string; quantity: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [showOrderingModal, setShowOrderingModal] = useState(false);

  // Cart persistence
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      // This part of the code was removed from the new_code, so it's removed here.
      // The useCart context handles persistence.
    }
  }, []);
  useEffect(() => {
    // This part of the code was removed from the new_code, so it's removed here.
    // The useCart context handles persistence.
  }, [cart]);

  useEffect(() => {
    fetch('/api/settings/ordering')
      .then(res => res.json())
      .then(data => setOrderingEnabled(data.orderingEnabled))
      .catch(() => setOrderingEnabled(true));
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const handleQuantityChange = (name: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.name] || 1;
    // Play sound
    if (typeof window !== 'undefined') {
      const audio = new Audio('/add-to-cart.mp3');
      audio.volume = 0.25;
      audio.play();
    }
    addToCart({
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
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
    removeFromCart(name);
  };

  const handleUpdateCartQty = (name: string, qty: number) => {
    updateQty(name, qty);
  };

  const handlePay = async () => {
    if (!orderingEnabled) {
      setShowOrderingModal(true);
      return;
    }
    if (!name || name.trim().length < 2) {
      setNameError("Please enter your name.");
      return;
    }
    setNameError("");
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
        customer: name,
        phone,
        items: cart,
        status: "pending",
        date: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      setLastOrder(cart);
      clearCart();
      setCartOpen(false);
      setShowSuccess(true);
      setPhone("");
      setName("");
    }
  };

  const getPriceValue = (price: string) => parseInt(price.replace(/[^\d]/g, ""), 10) || 0;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-16 px-4 animate-page-fade-in">
      {/* Full Page Plantain Background */}
      <div className="fixed inset-0 w-full min-h-screen h-full -z-20 overflow-hidden">
        <Image
          src="/plantain-bg.png"
          alt="Plantain chips background"
          fill
          priority
          className="object-cover w-full h-full select-none pointer-events-none animate-kenburns"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="w-full max-w-4xl flex items-center mb-8">
        <Link href="/" className="glass-card flex items-center gap-2 px-5 py-2 rounded-full shadow border border-[#7ed957] text-[#7ed957] font-bold hover:bg-[#45523e] hover:text-white transition">
          <FaArrowLeft className="text-lg" />
          Back to Home
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-10 text-[#7ed957] drop-shadow" style={{ fontFamily: 'var(--font-brand)' }}>Our Products</h1>
      <div className="flex flex-col sm:flex-row gap-10 items-center justify-center w-full max-w-4xl">
        {products.map((product) => (
          <div key={product.name} className={`glass-card w-80 h-auto flex flex-col items-center p-6 rounded-2xl shadow-lg border border-[#7ed957] animate-fade-in-up relative ${!product.available ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            {!product.available && (
              <span className="absolute top-4 right-4 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full z-10">Unavailable</span>
            )}
            <div className="relative w-56 h-56 rounded-xl overflow-hidden mb-4 border border-[#7ed957]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="224px"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 text-[#7ed957] text-center" style={{ fontFamily: 'var(--font-brand)' }}>{product.name}</h2>
            <p className="text-yellow-50 text-center mb-4 text-base leading-relaxed">{product.description}</p>
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-lg font-bold text-[#7ed957]">{product.price}</span>
              <div className="flex items-center gap-2">
                <label htmlFor={`qty-${product.name}`} className="text-yellow-50 text-sm">Qty:</label>
                <input
                  id={`qty-${product.name}`}
                  type="number"
                  min={0}
                  value={quantities[product.name] === undefined ? '' : quantities[product.name]}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || val === '0') {
                      setQuantities(q => {
                        const newQ = { ...q };
                        delete newQ[product.name];
                        return newQ;
                      });
                    } else {
                      handleQuantityChange(product.name, Math.max(1, parseInt(val) || 1));
                    }
                  }}
                  className="w-14 px-2 py-1 rounded bg-black/40 border border-[#7ed957] text-yellow-50 text-center"
                  disabled={!product.available}
                />
              </div>
            </div>
            <button
              className="mt-auto px-6 py-2 rounded-full bg-[#7ed957] text-[#45523e] font-bold text-base shadow-lg hover:bg-[#45523e] transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleAddToCart(product)}
              disabled={!product.available}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
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
          name={name}
          setName={setName}
          nameError={nameError}
        />
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card relative p-10 rounded-3xl shadow-2xl border border-[#7ed957] flex flex-col items-center max-w-md w-full min-w-[320px]">
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-3xl text-[#7ed957] hover:text-[#45523e] bg-black/30 rounded-full w-10 h-10 flex items-center justify-center border border-[#7ed957] shadow"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-extrabold text-[#7ed957] mb-2 text-center" style={{ fontFamily: 'var(--font-brand)' }}>Payment Successful!</h3>
            <div className="text-yellow-50 mb-4 text-center">
              <div className="font-bold text-lg text-[#7ed957] mb-1">Thank you for your order!</div>
              <div className="text-yellow-100 text-base mb-2">Your order has been placed and will be processed soon.</div>
              <div className="mb-2">Order Summary:</div>
              <ul className="mb-2 divide-y divide-yellow-100">
                {lastOrder.map((item) => (
                  <li key={item.name} className="py-1 flex items-center justify-between">
                    <span className="font-semibold text-yellow-900">{item.name}</span>
                    <span className="text-yellow-700">x{item.quantity}</span>
                    <span className="text-yellow-700 font-bold">₦{getPriceValue(item.price) * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="font-bold text-[#7ed957] mt-2">
                Total: ₦{lastOrder.reduce((sum, item) => sum + getPriceValue(item.price) * item.quantity, 0)}
              </div>
            </div>
            <button
              className="px-6 py-2 rounded-full bg-[#7ed957] text-[#45523e] font-bold shadow hover:bg-[#45523e] transition text-base min-w-[140px]"
              onClick={() => setShowSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {addedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card relative p-10 rounded-3xl shadow-2xl border border-[#7ed957] flex flex-col items-center max-w-md w-full min-w-[320px]">
            <button
              onClick={() => setAddedModal(null)}
              className="absolute top-4 right-4 text-3xl text-[#7ed957] hover:text-[#45523e] bg-black/30 rounded-full w-10 h-10 flex items-center justify-center border border-[#7ed957] shadow"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-extrabold text-[#7ed957] mb-2 text-center" style={{ fontFamily: 'var(--font-brand)' }}>Product Added to Cart!</h3>
            <div className="text-yellow-50 mb-4 text-center">
              <div className="font-bold text-lg text-[#7ed957] mb-1">{addedModal.name}</div>
              <div className="text-yellow-200 text-base mb-1">Price: <span className="font-bold">{addedModal.price}</span></div>
              <div className="text-yellow-100 text-base">Quantity: <span className="font-bold">{addedModal.quantity}</span></div>
            </div>
            <div className="text-yellow-100 text-center mb-6">
              You can proceed to checkout or continue shopping to add more products.<br />
              <span className="text-yellow-300 font-semibold">Thank you for choosing Crunchy Cruise Snacks!&apos;</span>
            </div>
            <div className="flex gap-4 mt-2 w-full justify-center">
              <button
                className="px-6 py-2 rounded-full bg-[#7ed957] text-[#45523e] font-bold shadow hover:bg-[#45523e] transition text-base min-w-[140px]"
                onClick={() => {
                  setAddedModal(null);
                  // Open the global cart modal
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('open-global-cart-modal'));
                  }
                }}
              >
                Proceed to Checkout
              </button>
              <button
                className="px-6 py-2 rounded-full bg-black/70 text-[#7ed957] border border-[#7ed957] font-bold shadow hover:bg-[#45523e] transition text-base min-w-[140px]"
                onClick={() => setAddedModal(null)}
              >
                Add More
              </button>
            </div>
          </div>
        </div>
      )}
      {showOrderingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-3xl shadow-2xl border border-[#7ed957] bg-white/90 flex flex-col items-center max-w-md w-full min-w-[320px] animate-fade-in-up">
            <h2 className="text-2xl font-extrabold text-[#7ed957] mb-4 text-center" style={{ fontFamily: 'var(--font-brand)' }}>Ordering Unavailable</h2>
            <p className="text-yellow-800 text-center mb-6">We&apos;re currently out of stock, but production is starting soon! Please check back later to enjoy our delicious products.</p>
            <button
              className="mt-2 px-6 py-2 rounded-full bg-[#7ed957] text-[#45523e] font-bold text-base shadow-lg hover:bg-[#45523e] transition"
              onClick={() => setShowOrderingModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Toast message */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-[#7ed957] text-yellow-900 font-bold px-6 py-3 rounded-full shadow-lg border border-[#7ed957] animate-toast-zoom-fade text-center text-base">
          {toast}
        </div>
      )}
    </div>
  );
} 