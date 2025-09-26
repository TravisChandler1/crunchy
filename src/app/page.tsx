"use client";
import Image from "next/image";
import Link from "next/link";
import { FaQuoteLeft, FaQuoteRight, FaTruck, FaStar, FaLeaf, FaBoxOpen, FaUserCog, FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import ScrollReveal from "./ScrollReveal";
// Removed: import PrizeWheel from "./PrizeWheel";

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
    <section className="w-full max-w-3xl mx-auto my-16 bg-white rounded-3xl shadow-xl border pt-8 pb-8" style={{ borderColor: '#7ed957' }}>
      <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#7ed957', fontFamily: 'var(--font-brand)' }}>Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col gap-5 items-center">
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold" style={{ color: '#45523e' }}>Name</label>
        <input
            id="name"
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: '#7ed957',
              color: '#45523e',
              background: '#f8fff3',
              fontWeight: 500,
              fontFamily: 'var(--font-brand)'
            }}
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold" style={{ color: '#45523e' }}>Email</label>
        <input
            id="email"
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: '#7ed957',
              color: '#45523e',
              background: '#f8fff3',
              fontWeight: 500,
              fontFamily: 'var(--font-brand)'
            }}
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-semibold" style={{ color: '#45523e' }}>Message</label>
        <textarea
            id="message"
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          rows={4}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: '#7ed957',
              color: '#45523e',
              background: '#f8fff3',
              fontWeight: 500,
              fontFamily: 'var(--font-brand)'
            }}
        />
        </div>
        <button
          type="submit"
          className="w-full mt-2 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition"
          style={{ background: '#7ed957', color: '#45523e', fontFamily: 'var(--font-brand)' }}
        >
          Send Message
        </button>
        {sent && <div className="text-center font-bold mt-2" style={{ color: '#7ed957' }}>Thank you for your message!</div>}
      </form>
    </section>
  );
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<{ name: string; text: string }[]>([]);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', text: '' });
  const [testimonialSent, setTestimonialSent] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(() => setTestimonials([]));
  }, []);
  useEffect(() => {
    if (testimonials.length < 2) return;
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCarouselIndex(i => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, isCarouselPaused]);
  const handleTestimonialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTestimonialForm({ ...testimonialForm, [e.target.name]: e.target.value });
  const handleTestimonialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testimonialForm),
    });
    setTestimonialSent(true);
    setTestimonials((prev) => [...prev, { ...testimonialForm }]); // Add instantly
    setTestimonialForm({ name: '', text: '' });
    setTimeout(() => setTestimonialSent(false), 3000);
    setShowTestimonialModal(false);
    setCarouselIndex(testimonials.length); // Move to the new testimonial
  };
  // Carousel navigation
  const prevTestimonial = useCallback(() => setCarouselIndex((i) => (i - 1 + testimonials.length) % testimonials.length), [testimonials.length]);
  const nextTestimonial = useCallback(() => setCarouselIndex((i) => (i + 1) % testimonials.length), [testimonials.length]);
  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevTestimonial();
      if (e.key === 'ArrowRight') nextTestimonial();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [testimonials.length, nextTestimonial, prevTestimonial]);
  return (
    <div className="relative min-h-screen font-sans flex flex-col items-center p-0 text-[var(--foreground)] overflow-x-hidden select-none animate-page-fade-in" onContextMenu={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()}>
      {/* Logo at the extreme top-left, above all content */}
      <div className="absolute top-6 left-6 z-30">
        <Image src="/logo-3.jpeg" alt="Crunchy Cruise Logo" width={140} height={140} className="rounded-full shadow-xl bg-white" priority />
      </div>
      {/* Admin Icon */}
      <Link href="/admin" className="fixed top-4 right-4 z-50 rounded-full p-3 shadow-lg transition flex items-center justify-center" style={{ background: '#45523e' }}>
        <FaUserCog className="text-2xl text-white" />
      </Link>
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
        <div className="absolute inset-0 bg-black/87" />
      </div>
      {/* Hero Section */}
      <header className="w-full max-w-3xl text-center mt-24 mb-12 relative z-10 flex flex-col items-center gap-4 py-12 bg-white/10 rounded-3xl shadow-xl border border-white/20 backdrop-blur-md">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight drop-shadow-lg"
          style={{ color: '#7ed957', fontFamily: 'var(--font-brand)' }}
        >
          Crunchy Cruise Snacks
        </h1>
        <p className="text-xl sm:text-2xl font-medium mb-1 text-white drop-shadow">Premium Plantain Chips</p>
        <p className="italic text-lg font-semibold drop-shadow mb-4" style={{ color: '#45523e', fontFamily: 'var(--font-brand)' }}>“As you dey crunch, just dey cruise”</p>
        <Link href="/products" className="inline-block mt-2 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition animate-fade-in-up hover:scale-105"
          style={{ background: '#45523e', color: 'white' }}>
          Check Products
        </Link>
      </header>
      {/* What We Offer */}
      <ScrollReveal>
      <section className="w-full text-center mt-24 mb-12 relative z-10 flex flex-col items-center gap-4 py-12" style={{ background: '#45523e' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#7ed957' }}>What We Offer</h2>
        <div className="w-full px-8 flex flex-col sm:flex-row flex-wrap gap-6 justify-center items-stretch">
          {/* Delivery */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs h-full flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl" style={{ zIndex: 1 }}>
            <FaTruck className="text-white text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-white mb-1">Delivery</h3>
            <p className="text-white/90 text-center">Get your favorite Crunchy Cruise Snacks delivered straight to your doorstep, fresh and fast, so you can keep cruising without missing a crunch.</p>
          </div>
          {/* Premium Taste */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs h-full flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl" style={{ zIndex: 1 }}>
            <FaStar className="text-white text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-white mb-1">Premium Taste</h3>
            <p className="text-white/90 text-center">Experience the irresistible flavor and perfect crunch of our expertly crafted plantain chips—each bite is a taste of pure joy and quality.</p>
          </div>
          {/* Pure Natural Ingredients */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs h-full flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl" style={{ zIndex: 1 }}>
            <FaLeaf className="text-white text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-white mb-1">Pure Natural Ingredients</h3>
            <p className="text-white/90 text-center">Made with only the freshest plantains and natural ingredients, our chips are free from artificial additives—just pure, wholesome goodness in every pack.</p>
          </div>
          {/* Pleasing Packaging */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs h-full flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl" style={{ zIndex: 1 }}>
            <FaBoxOpen className="text-white text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-white mb-1">Pleasing Packaging</h3>
            <p className="text-white/90 text-center">Our snacks come in attractive, secure packaging that keeps them fresh and makes every unboxing a delight—perfect for gifting or enjoying on the go.</p>
          </div>
          {/* NAFDAC Approved */}
          <div className="glass-card flex-1 min-w-[220px] max-w-xs h-full flex flex-col items-center p-8 gap-3 animate-fade-in-up animate-float mx-auto my-4 shadow-xl border-2 border-green-600" style={{ zIndex: 1 }}>
            <FaCheckCircle className="text-white text-4xl mb-1" />
            <h3 className="text-lg font-semibold text-white mb-1">NAFDAC APPROVED</h3>
            <p className="text-white text-center mb-2">
              Certified and approved by NAFDAC for your safety and peace of mind. Dey Crunch, the law dey our back 😄
            </p>
          </div>
        </div>
      </section>
      </ScrollReveal>
      {/* About Section */}
      <ScrollReveal>
      <section className="w-full max-w-3xl mb-12 mt-4 glass-card p-8 flex flex-col gap-2 items-center text-center">
        <h2 className="text-2xl font-bold mb-2 text-white" style={{ color: '#7ed957' }}>About Our Chips</h2>
        <p className="text-base sm:text-lg text-white">Crunchy Cruise Snacks brings you the finest plantain chips, crafted with care from the freshest plantains. Whether you love the sweet taste of ripe plantains or the hearty crunch of unripe ones, our chips are the perfect companion for your cruise through life. Enjoy them at home, at work, or on the go!</p>
       </section>
       </ScrollReveal>
       {/* Product Carousel */}
       <section id="products" className="w-full mb-12 glass-card p-8 flex flex-col gap-6 items-center text-center">
         <h2 className="text-2xl font-bold mb-4" style={{ color: '#7ed957' }}>Our Products</h2>
         <div className="flex flex-col sm:flex-row gap-8 items-center justify-center w-full px-8">
          {products.map((product) => (
            <div
              key={product.name}
              className="shadow-md p-4 flex flex-col items-center w-80 h-96 animate-fade-in-up animate-float transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_32px_8px_rgba(194,168,107,0.25)] shadow-[0_0_16px_4px_rgba(194,168,107,0.12)] rounded-3xl"
              style={{ background: '#45523e' }}
            >
              <div className="w-full h-48 relative mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-2xl"
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
      <section className="w-full mb-12 glass-card p-8 flex flex-col gap-6 items-center text-center relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#7ed957' }}>Testimonials</h2>
        <div className="relative w-full flex flex-col items-center">
          <div
            className="relative flex items-center justify-center w-full max-w-2xl mx-auto h-72"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            onFocus={() => setIsCarouselPaused(true)}
            onBlur={() => setIsCarouselPaused(false)}
          >
            {/* Left arrow */}
            <button
              aria-label="Previous testimonial"
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow bg-[#7ed957] text-white hover:bg-[#5bbf21] transition disabled:opacity-40"
              disabled={testimonials.length < 2}
            >
              <FaChevronLeft className="text-2xl" />
            </button>
            {/* Carousel cards */}
            <div className="flex w-full justify-center items-center overflow-visible relative" style={{ minHeight: 260 }}>
              {testimonials.length > 0 && testimonials.map((t, i) => {
                // Calculate position relative to center
                const pos = i - carouselIndex;
                const style: React.CSSProperties = {
                  transition: 'transform 0.5s cubic-bezier(.7,.2,.2,1), filter 0.5s',
                  zIndex: 10 - Math.abs(pos),
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) scale(${pos === 0 ? 1 : 0.82}) translateX(${pos * 260}px)`,
                  filter: pos === 0 ? 'none' : 'blur(3.5px) grayscale(0.5) brightness(0.85)',
                  opacity: Math.abs(pos) > 2 ? 0 : 1,
                  pointerEvents: pos === 0 ? 'auto' : 'none',
                  width: 320,
                  maxWidth: '90vw',
                };
                return (
                  <div
                    key={i}
                    className={`glass-card rounded-lg shadow flex flex-col items-center border border-yellow-100 w-80 h-64 p-6 mx-4 ${pos === 0 ? 'scale-105' : ''}`}
                    style={style}
                  >
                    <FaQuoteLeft className="text-[#7ed957] text-2xl mb-2" />
                    <p className="text-yellow-50 italic mb-2 text-center text-lg leading-relaxed break-words">{t.text}</p>
                    <FaQuoteRight className="text-[#7ed957] text-xl mb-1 self-end" />
                    <span className="font-semibold text-white mt-2">- {t.name}</span>
                  </div>
                );
              })}
            </div>
            {/* Right arrow */}
            <button
              aria-label="Next testimonial"
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow bg-[#7ed957] text-white hover:bg-[#5bbf21] transition disabled:opacity-40"
              disabled={testimonials.length < 2}
            >
              <FaChevronRight className="text-2xl" />
            </button>
          </div>
          {/* Dots */}
          <div className="flex gap-2 mt-4 justify-center">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full ${i === carouselIndex ? '' : 'bg-yellow-100'} transition`}
                onClick={() => setCarouselIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                style={i === carouselIndex ? { background: '#45523e' } : {}}
              />
            ))}
          </div>
        </div>
        {/* Testimonial Submission Button and Modal */}
        <button
          onClick={() => setShowTestimonialModal(true)}
          className="mt-8 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition"
          style={{ background: '#45523e', color: 'white' }}
        >
          Share your experience
        </button>
        {showTestimonialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="glass-card p-8 rounded-3xl shadow-2xl border flex flex-col items-center max-w-md w-full min-w-[320px]" style={{ borderColor: '#45523e' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#45523e' }}>Share your experience</h3>
              <form onSubmit={handleTestimonialSubmit} className="w-full flex flex-col gap-4 mt-2 items-center">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={testimonialForm.name}
                  onChange={handleTestimonialChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: '#45523e', color: '#45523e', background: 'white' }}
                />
                <textarea
                  name="text"
                  placeholder="Your Testimonial"
                  value={testimonialForm.text}
                  onChange={handleTestimonialChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: '#45523e', color: '#45523e', background: 'white' }}
                />
                <button
                  type="submit"
                  className="mt-2 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition"
                  style={{ background: '#45523e', color: 'white' }}
                  disabled={testimonialSent}
                >
                  {testimonialSent ? 'Thank you!' : 'Submit Testimonial'}
                </button>
              </form>
              <button
                onClick={() => setShowTestimonialModal(false)}
                className="mt-4 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition"
                style={{ background: '#7ed957', color: '#45523e' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Decorative SVG wave at the bottom */}
        <svg
          className="absolute left-0 bottom-0 w-full"
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: 40 }}
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C480,60 960,0 1440,20 L1440,60 L0,60 Z"
            fill="#fff"
            fillOpacity="0.7"
          />
        </svg>
      </section>
      {/* Picture Gallery */}
      <section className="w-full max-w-3xl mb-16 overflow-x-hidden glass-card p-8 flex flex-col gap-6 items-center text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#7ed957' }}>Gallery</h2>
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
      {/* Meet the Man Behind the Flavour */}
      <section
        className="w-full relative py-20 flex flex-col items-center justify-center pb-32 sm:pb-20"
        style={{
          background: '#45523e'
        }}
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 tracking-widest"
              style={{ letterSpacing: 2, fontFamily: 'var(--font-brand)', color: '#7ed957' }}>
            MEET THE MAN BEHIND THE FLAVOUR
          </h2>
          <Image
            src="/ceo.jpeg"
            alt="Olayinka Afolabi"
            width={180}
            height={180}
            className="rounded-full shadow-2xl border-4 border-white mb-6 object-cover bg-white"
            priority
          />
          <div className="text-2xl font-bold text-yellow-100 mb-2 text-center">Olayinka Afolabi</div>
          <p className="text-lg text-white/90 text-center max-w-2xl mb-2">
            Olayinka Afolabi is the passionate founder and creative force behind Crunchy Cruise Snacks. With a love for authentic flavors and a commitment to quality, Olayinka has dedicated himself to bringing the joy of premium plantain chips to snack lovers everywhere. His vision blends tradition with innovation, ensuring every bite is a celebration of taste, freshness, and Nigerian pride. Whether perfecting recipes or connecting with customers, Olayinka&apos;s warmth and dedication shine through in every pack. Join him on this delicious journey—because as you dey crunch, just dey cruise!
          </p>
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: 60 }}
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C480,120 960,0 1440,40 L1440,80 L0,80 Z"
            fill="#45523e"
          />
          <path
            d="M0,60 C480,100 960,20 1440,60 L1440,80 L0,80 Z"
            fill="#fff"
            fillOpacity="0.15"
          />
        </svg>
      </section>
      <ContactSection />
    </div>
  );
}
