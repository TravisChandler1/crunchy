"use client";
import Image from "next/image";
import { FaQuoteLeft, FaQuoteRight, FaTruck, FaStar, FaLeaf, FaBoxOpen, FaUserCog } from "react-icons/fa";
import { useState, useEffect } from "react";
import React from "react";
import PrizeWheel from "./PrizeWheel";

const galleryImages = [
  "/1.jpeg",
  "/2.jpeg",
  "/3.jpeg",
  "/4.jpeg",
  "/5.jpeg",
  "/6.jpeg",
  "/7.jpeg",
  "/8.jpeg",
  "/9.jpeg",
  "/10.jpeg",
  "/ceo.jpeg",
];

const products = [
  {
    name: "Ripe Plantain Chips",
    description: "Sweet, golden, and perfectly crunchy. Made from ripe plantains for a naturally sweet snack.",
    image: "/ripe-plantain.jpeg",
  },
  {
    name: "Unripe Plantain Chips",
    description: "Savory, green, and extra crispy. Made from unripe plantains for a classic, hearty crunch.",
    image: "/unripe-plantain.jpeg",
  },
];

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };
  return (
    <section className="w-full max-w-3xl mx-auto my-16 bg-white rounded-3xl shadow-xl border border-yellow-200 p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-[#b6862c]" style={{ fontFamily: 'var(--font-brand)' }}>Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-lg border border-yellow-200 text-[#b6862c] placeholder-[#b6862c]/60 bg-white focus:outline-none focus:ring-2 focus:ring-[#b6862c]"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-lg border border-yellow-200 text-[#b6862c] placeholder-[#b6862c]/60 bg-white focus:outline-none focus:ring-2 focus:ring-[#b6862c]"
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-yellow-200 text-[#b6862c] placeholder-[#b6862c]/60 bg-white focus:outline-none focus:ring-2 focus:ring-[#b6862c]"
        />
        <button
          type="submit"
          className="mt-2 px-8 py-3 rounded-full bg-[#b6862c] text-white font-bold text-lg shadow-lg hover:bg-yellow-700 transition"
        >
          Send Message
        </button>
        {sent && <div className="text-center text-[#b6862c] font-bold mt-2">Thank you for your message!</div>}
      </form>
    </section>
  );
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<{ name: string; text: string }[]>([]);
  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(() => setTestimonials([]));
  }, []);
  return (
    <div className="relative min-h-screen font-sans flex flex-col items-center p-0 text-[var(--foreground)] overflow-x-hidden">
      {/* Logo at the very top */}
      <div className="w-full flex justify-center mt-8 mb-2 z-20">
        <Image src="/logo-1.jpeg" alt="Crunchy Cruise Logo" width={96} height={96} className="rounded-full border-4 border-yellow-200 shadow-xl bg-white" priority />
      </div>
      {/* Admin Icon */}
      <a href="/admin" className="fixed top-4 right-4 z-50 bg-yellow-300 text-yellow-900 rounded-full p-3 shadow-lg hover:bg-yellow-400 transition flex items-center justify-center" title="Admin Login">
        <FaUserCog className="text-2xl" />
      </a>
      {/* Full Page Plantain Background */}
      <div className="fixed inset-0 w-full min-h-screen h-full -z-20 overflow-hidden">
        <Image
          src="/plantain-bg.png"
          alt="Plantain chips background"
          fill
          priority
          className="object-cover w-full h-full select-none pointer-events-none"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/90" />
      </div>
      {/* Hero Section */}
      <header className="w-full max-w-3xl text-center mt-24 mb-12 relative z-10 flex flex-col items-center gap-4 py-12 bg-white/10 rounded-3xl shadow-xl border border-white/20 backdrop-blur-md">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight text-yellow-300 drop-shadow-lg" style={{ fontFamily: 'var(--font-brand)' }}>Crunchy Cruise Snacks</h1>
        <p className="text-xl sm:text-2xl font-medium mb-1 text-white drop-shadow">Premium Plantain Chips</p>
        <p className="italic text-lg text-yellow-200 font-semibold drop-shadow mb-4" style={{ fontFamily: 'var(--font-brand)' }}>“As you dey crunch, just dey cruise”</p>
        <a href="/products" className="inline-block mt-2 px-8 py-3 rounded-full bg-yellow-300 text-yellow-900 font-bold text-lg shadow-lg hover:bg-yellow-400 transition">Check Products</a>
      </header>
      {/* What We Offer */}
      <section className="w-full text-center mt-24 mb-12 relative z-10 flex flex-col items-center gap-4 py-12 bg-[#b6862c]">
        <h2 className="text-2xl font-bold mb-6 text-yellow-200 drop-shadow">What We Offer</h2>
        <div className="max-w-3xl w-full mx-auto flex flex-col sm:flex-row flex-wrap gap-6 justify-center items-center">
          {/* Delivery */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl" style={{ zIndex: 1 }}>
            <FaTruck className="text-yellow-300 text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-yellow-300 mb-1">Delivery</h3>
            <p className="text-white/90 text-center">Get your favorite Crunchy Cruise Snacks delivered straight to your doorstep, fresh and fast, so you can keep cruising without missing a crunch.</p>
          </div>
          {/* Premium Taste */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl" style={{ zIndex: 1 }}>
            <FaStar className="text-yellow-300 text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-yellow-300 mb-1">Premium Taste</h3>
            <p className="text-white/90 text-center">Experience the irresistible flavor and perfect crunch of our expertly crafted plantain chips—each bite is a taste of pure joy and quality.</p>
          </div>
          {/* Pure Natural Ingredients */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl" style={{ zIndex: 1 }}>
            <FaLeaf className="text-yellow-300 text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-yellow-300 mb-1">Pure Natural Ingredients</h3>
            <p className="text-white/90 text-center">Made with only the freshest plantains and natural ingredients, our chips are free from artificial additives—just pure, wholesome goodness in every pack.</p>
          </div>
          {/* Pleasing Packaging */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl" style={{ zIndex: 1 }}>
            <FaBoxOpen className="text-yellow-300 text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-yellow-300 mb-1">Pleasing Packaging</h3>
            <p className="text-white/90 text-center">Our snacks come in attractive, secure packaging that keeps them fresh and makes every unboxing a delight—perfect for gifting or enjoying on the go.</p>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="w-full max-w-3xl mb-12 mt-4 glass-card p-8 flex flex-col gap-2 items-center text-center">
        <h2 className="text-2xl font-bold mb-2 text-yellow-800">About Our Chips</h2>
        <p className="text-base sm:text-lg text-yellow-50">Crunchy Cruise Snacks brings you the finest plantain chips, crafted with care from the freshest plantains. Whether you love the sweet taste of ripe plantains or the hearty crunch of unripe ones, our chips are the perfect companion for your cruise through life. Enjoy them at home, at work, or on the go!</p>
      </section>
      {/* Product Carousel */}
      <section id="products" className="w-full max-w-3xl mb-12 glass-card p-8 flex flex-col gap-6 items-center text-center">
        <h2 className="text-2xl font-bold mb-4 text-yellow-800">Our Products</h2>
        <div className="flex flex-col sm:flex-row gap-8 items-center justify-center w-full">
          {products.map((product) => (
            <div
              key={product.name}
              className="rounded-lg shadow-md p-4 flex flex-col items-center w-80 h-96 border border-yellow-700 animate-fade-in-up animate-float transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_32px_8px_rgba(255,215,0,0.5)] shadow-[0_0_16px_4px_rgba(255,215,0,0.2)]"
              style={{ background: '#b6862c' }}
            >
              <div className="w-full h-48 relative mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md border border-yellow-200"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-white">{product.name}</h3>
              <p className="text-white text-sm text-center">{product.description}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Testimonials */}
      <section className="w-full mb-12 glass-card p-8 flex flex-col gap-6 items-center text-center">
        <h2 className="text-2xl font-bold mb-4 text-yellow-800">Testimonials</h2>
        <div className="relative w-full overflow-x-hidden">
          <div className="max-w-3xl w-full mx-auto">
            <div className="flex items-center gap-10 animate-marquee" style={{ animation: 'marquee 12s linear infinite', width: 'max-content', minWidth: '120vw' }}>
              {[...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={i}
                  className="glass-card flex-shrink-0 rounded-lg shadow flex flex-col items-center border border-yellow-100 w-80 h-64 p-6 mx-4"
                >
                  <FaQuoteLeft className="text-yellow-400 text-2xl mb-2" />
                  <p className="text-yellow-50 italic mb-2 text-center text-lg leading-relaxed break-words">{t.text}</p>
                  <FaQuoteRight className="text-yellow-400 text-xl mb-1 self-end" />
                  <span className="font-semibold text-yellow-700 mt-2">- {t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Picture Gallery */}
      <section className="w-full max-w-3xl mb-16 overflow-x-hidden glass-card p-8 flex flex-col gap-6 items-center text-center">
        <h2 className="text-2xl font-bold mb-4 text-yellow-800">Gallery</h2>
        <div className="relative w-full overflow-x-hidden">
          <div
            className="flex items-center h-56 sm:h-72 animate-marquee whitespace-nowrap"
            style={{
              animation: 'marquee 15s linear infinite',
              minWidth: `calc(${galleryImages.slice(0, 10).length} * 18rem)` // 18rem = w-72
            }}
          >
            {[...galleryImages.slice(0, 10)].reverse().map((src, i) => (
              <div key={i} className="relative w-56 h-56 sm:w-72 sm:h-72 mx-2 rounded-lg overflow-hidden border border-yellow-100 flex-shrink-0">
                <Image
                  src={src}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 224px, 288px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <PrizeWheel />
      <ContactSection />
    </div>
  );
}
