"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaBoxOpen, FaStar, FaTruck, FaCog, FaEnvelope, FaEdit, FaTrash, FaHome } from "react-icons/fa";

const ADMIN_PASSWORD = "afolabi94";

const sections = ["Dashboard", "Products", "Orders", "Testimonials", "Messages"];

const sectionIcons = [
  <FaCog key="Dashboard" />, // Dashboard
  <FaBoxOpen key="Products" />, // Products
  <FaTruck key="Orders" />, // Orders
  <FaStar key="Testimonials" />, // Testimonials
  <FaEnvelope key="Messages" /> // Messages
];

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  available: boolean;
};

type Order = {
  id: string;
  customer: string;
  items: { name: string; quantity: number; price: string }[];
  status: string;
  date: string;
  phone: string;
};

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
};

type Testimonial = {
  id: string;
  name: string;
  text: string;
  date: string;
};

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [section, setSection] = useState("Dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [orderingLoading, setOrderingLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', text: '' });
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedIn(localStorage.getItem("admin_logged_in") === "true");
    }
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    // Placeholder fetch, replace with your real API endpoint
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => setOrders([
        { id: '1', customer: 'John Doe', items: [{ name: 'Ripe Plantain Chips', quantity: 2, price: '₦4,500' }], status: 'pending', date: '2024-06-01', phone: '+2348012345678' },
        { id: '2', customer: 'Jane Smith', items: [{ name: 'Unripe Plantain Chips', quantity: 1, price: '₦4,500' }], status: 'fulfilled', date: '2024-06-02', phone: '+2348012345679' },
      ]));
  }, []);

  useEffect(() => {
    // Placeholder fetch, replace with your real API endpoint
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(() => setMessages([
        { id: '1', name: 'Ada O.', email: 'ada@example.com', message: 'Love your chips!', date: '2024-06-01' },
        { id: '2', name: 'Victor Olabanji', email: 'victor@example.com', message: 'How do I become a distributor?', date: '2024-06-02' },
      ]));
  }, []);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(() => setTestimonials([]));
  }, []);

  useEffect(() => {
    fetch('/api/settings/ordering')
      .then(res => res.json())
      .then(data => setOrderingEnabled(data.orderingEnabled))
      .catch(() => setOrderingEnabled(true));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("admin_logged_in");
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleAddOrEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // Update product
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProduct.id, ...productForm })
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map(p => p.id === updated.id ? updated : p));
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', image: '' });
      }
    } else {
      // Add product
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      if (res.ok) {
        const created = await res.json();
        setProducts([...products, created]);
        setProductForm({ name: '', description: '', price: '', image: '' });
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({ name: product.name, description: product.description, price: product.price, image: product.image });
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) setProducts(products.filter(p => p.id !== id));
    if (editingProduct && editingProduct.id === id) setEditingProduct(null);
  };

  const handleOrderStatus = async (id: string, status: string) => {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(orders => orders.map(o => o.id === updated.id ? updated : o));
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const res = await fetch('/api/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) setOrders(orders => orders.filter(o => o.id !== id));
  };

  const handleDeleteMessage = async (id: string) => {
    const res = await fetch('/api/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) setMessages(msgs => msgs.filter(m => m.id !== id));
  };

  const handleTestimonialFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTestimonialForm({ ...testimonialForm, [e.target.name]: e.target.value });
  };

  const handleAddOrEditTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestimonial) {
      // Update testimonial
      const res = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingTestimonial.id, ...testimonialForm })
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonials(testimonials.map(t => t.id === updated.id ? updated : t));
        setEditingTestimonial(null);
        setTestimonialForm({ name: '', text: '' });
      }
    } else {
      // Add testimonial
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialForm)
      });
      if (res.ok) {
        const created = await res.json();
        setTestimonials([...testimonials, created]);
        setTestimonialForm({ name: '', text: '' });
      }
    }
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialForm({ name: testimonial.name, text: testimonial.text });
  };

  const handleDeleteTestimonial = async (id: string) => {
    const res = await fetch('/api/testimonials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) setTestimonials(testimonials.filter(t => t.id !== id));
    if (editingTestimonial && editingTestimonial.id === id) setEditingTestimonial(null);
  };

  const handleToggleOrdering = async () => {
    setOrderingLoading(true);
    const res = await fetch('/api/settings/ordering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderingEnabled: !orderingEnabled })
    });
    if (res.ok) {
      const data = await res.json();
      setOrderingEnabled(data.orderingEnabled);
    }
    setOrderingLoading(false);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-300">
        <div className="glass-card p-8 rounded-2xl shadow-lg border border-yellow-200 flex flex-col items-center max-w-xs w-full">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-4 py-2 rounded-lg border border-yellow-200 text-yellow-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
              required
            />
            <button type="submit" className="px-6 py-2 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 transition">Login</button>
            {error && <div className="text-red-500 text-center font-bold">{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-yellow-50 flex flex-col">
      <header className="w-full bg-[#b6862c] text-white py-6 px-8 flex items-center justify-between shadow">
        <h1 className="text-2xl font-bold tracking-wide">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full bg-yellow-300 text-yellow-900 hover:bg-yellow-400 transition border border-yellow-200 shadow flex items-center justify-center" title="Go to Homepage">
            <FaHome className="text-2xl" />
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-black text-yellow-300 font-bold border border-yellow-200 hover:bg-yellow-900 transition">Logout</button>
        </div>
      </header>
      <div className="flex flex-1 min-h-screen">
        <nav className={`transition-all duration-300 bg-black/80 border-r border-yellow-900 flex flex-col gap-2 py-8 px-2 h-screen ${sidebarOpen ? "w-56" : "w-14"}`} style={{ minWidth: sidebarOpen ? 224 : 56 }}>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="mb-4 p-2 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 transition self-end"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          {sections.map((s, i) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex items-center gap-2 text-left px-2 py-2 rounded-lg font-semibold transition w-full ${section === s ? "bg-[#b6862c] text-white" : "hover:bg-yellow-900/30 text-yellow-200"}`}
              style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
            >
              {sectionIcons[i]}
              {sidebarOpen && <span>{s}</span>}
              {!sidebarOpen && <span className="sr-only">{s}</span>}
            </button>
          ))}
        </nav>
        <main className="flex-1 w-full p-2 sm:p-8">
          {section === "Dashboard" && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-yellow-300">Welcome, Olayinka!</h2>
              <p className="text-yellow-100 mb-4">Here&apos;s a summary of everything that went down this week:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-black/40 rounded-xl p-6 border border-yellow-900 flex flex-col items-center">
                  {/* Product type has no createdAt/date, so count all products */}
                  <span className="text-3xl font-bold text-yellow-300 mb-1">{products.length}</span>
                  <span className="text-yellow-100">Products Added</span>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-yellow-900 flex flex-col items-center">
                  <span className="text-3xl font-bold text-yellow-300 mb-1">{orders.filter(o => new Date(o.date).getTime() > Date.now() - 7*24*60*60*1000).length}</span>
                  <span className="text-yellow-100">Orders Placed</span>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-yellow-900 flex flex-col items-center">
                  <span className="text-3xl font-bold text-yellow-300 mb-1">{testimonials.filter(t => new Date(t.date).getTime() > Date.now() - 7*24*60*60*1000).length}</span>
                  <span className="text-yellow-100">Testimonials Received</span>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-yellow-900 flex flex-col items-center">
                  <span className="text-3xl font-bold text-yellow-300 mb-1">{messages.filter(m => new Date(m.date).getTime() > Date.now() - 7*24*60*60*1000).length}</span>
                  <span className="text-yellow-100">Messages Received</span>
                </div>
              </div>
              <p className="text-yellow-200">Use the navigation to manage products, orders, testimonials, and messages.</p>
            </div>
          )}
          {section === "Products" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-yellow-300">Product Management</h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold text-yellow-200">Ordering:</span>
                <button
                  onClick={handleToggleOrdering}
                  className={`px-4 py-2 rounded-full font-bold shadow border transition ${orderingEnabled ? "bg-green-600 text-white border-green-700" : "bg-red-600 text-white border-red-700"}`}
                  disabled={orderingLoading}
                >
                  {orderingEnabled ? "Enabled" : "Disabled"}
                </button>
                {orderingLoading && <span className="text-yellow-200 ml-2">Saving...</span>}
              </div>
              <form onSubmit={handleAddOrEditProduct} className="mb-8 flex flex-col gap-3 bg-black/30 p-4 rounded-xl border border-yellow-900 max-w-lg">
                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                  placeholder="Product Name"
                  required
                  className="px-3 py-2 rounded border border-yellow-200 bg-black/10 text-yellow-900"
                />
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  placeholder="Description"
                  required
                  className="px-3 py-2 rounded border border-yellow-200 bg-black/10 text-yellow-900"
                />
                <input
                  name="price"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                  placeholder="Price (e.g. ₦4,500)"
                  required
                  className="px-3 py-2 rounded border border-yellow-200 bg-black/10 text-yellow-900"
                />
                <input
                  name="image"
                  value={productForm.image}
                  onChange={handleProductFormChange}
                  placeholder="Image URL"
                  required
                  className="px-3 py-2 rounded border border-yellow-200 bg-black/10 text-yellow-900"
                />
                <button type="submit" className="px-4 py-2 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 transition">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: '', image: '' }); }} className="text-xs text-yellow-200 mt-1 underline">Cancel Edit</button>
                )}
              </form>
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full border border-yellow-900 bg-black/40">
                  <thead>
                    <tr className="text-yellow-300">
                      <th className="p-2 border-b border-yellow-900">Image</th>
                      <th className="p-2 border-b border-yellow-900">Name</th>
                      <th className="p-2 border-b border-yellow-900">Description</th>
                      <th className="p-2 border-b border-yellow-900">Price</th>
                      <th className="p-2 border-b border-yellow-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="text-yellow-50">
                        <td className="p-2 border-b border-yellow-900"><Image src={product.image} alt={product.name} width={64} height={64} className="w-16 h-16 object-cover rounded" /></td>
                        <td className="p-2 border-b border-yellow-900 font-bold">{product.name}</td>
                        <td className="p-2 border-b border-yellow-900">{product.description}</td>
                        <td className="p-2 border-b border-yellow-900">{product.price}</td>
                        <td className="p-2 border-b border-yellow-900 flex gap-2 items-center">
                          <button onClick={() => handleEditProduct(product)} className="px-2 py-1 rounded bg-yellow-300 text-yellow-900 font-bold hover:bg-yellow-400 transition text-xs">Edit</button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="px-2 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-700 transition text-xs">Delete</button>
                          <button
                            onClick={async () => {
                              const res = await fetch('/api/products', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...product, available: !product.available })
                              });
                              if (res.ok) {
                                const updated = await res.json();
                                setProducts(products.map(p => p.id === updated.id ? updated : p));
                              }
                            }}
                            className={`px-2 py-1 rounded font-bold text-xs transition ${product.available ? 'bg-green-700 text-white hover:bg-green-900' : 'bg-gray-400 text-gray-900 hover:bg-gray-500'}`}
                          >
                            {product.available ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && <div className="text-yellow-200 mt-4">No products yet.</div>}
              </div>
            </div>
          )}
          {section === "Orders" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-yellow-300">Order Management</h2>
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full border border-yellow-900 bg-black/40">
                  <thead>
                    <tr className="text-yellow-300">
                      <th className="p-2 border-b border-yellow-900">Customer</th>
                      <th className="p-2 border-b border-yellow-900">Items</th>
                      <th className="p-2 border-b border-yellow-900">Status</th>
                      <th className="p-2 border-b border-yellow-900">Date</th>
                      <th className="p-2 border-b border-yellow-900">Phone</th>
                      <th className="p-2 border-b border-yellow-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="text-yellow-50">
                        <td className="p-2 border-b border-yellow-900 font-bold">{order.customer}</td>
                        <td className="p-2 border-b border-yellow-900">
                          <ul>
                            {order.items.map((item, idx) => (
                              <li key={idx}>{item.name} x{item.quantity} <span className="text-yellow-300">{item.price}</span></li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-2 border-b border-yellow-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'fulfilled' ? 'bg-green-600' : order.status === 'cancelled' ? 'bg-red-600' : 'bg-yellow-700'} text-white`}>{order.status}</span>
                        </td>
                        <td className="p-2 border-b border-yellow-900">{order.date}</td>
                        <td className="p-2 border-b border-yellow-900">{order.phone}</td>
                        <td className="p-2 border-b border-yellow-900 flex gap-2">
                          {order.status !== 'fulfilled' && (
                            <button onClick={() => handleOrderStatus(order.id, 'fulfilled')} className="px-2 py-1 rounded bg-green-500 text-white font-bold hover:bg-green-700 transition text-xs">Mark Fulfilled</button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button onClick={() => handleOrderStatus(order.id, 'cancelled')} className="px-2 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-700 transition text-xs">Cancel</button>
                          )}
                          <button onClick={() => handleDeleteOrder(order.id)} className="px-2 py-1 rounded bg-yellow-300 text-yellow-900 font-bold hover:bg-yellow-400 transition text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <div className="text-yellow-200 mt-4">No orders yet.</div>}
              </div>
            </div>
          )}
          {section === "Testimonials" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-yellow-300">Testimonial Management</h2>
              <form onSubmit={handleAddOrEditTestimonial} className="mb-8 flex flex-col gap-3 bg-black/30 p-4 rounded-xl border border-yellow-900 max-w-lg">
                <input
                  name="name"
                  value={testimonialForm.name}
                  onChange={handleTestimonialFormChange}
                  placeholder="Customer Name"
                  required
                  className="px-3 py-2 rounded border border-yellow-200 bg-black/10 text-yellow-900"
                />
                <textarea
                  name="text"
                  value={testimonialForm.text}
                  onChange={handleTestimonialFormChange}
                  placeholder="Testimonial Text"
                  required
                  className="px-3 py-2 rounded border border-yellow-200 bg-black/10 text-yellow-900"
                />
                <button type="submit" className="px-4 py-2 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 transition">
                  {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
                {editingTestimonial && (
                  <button type="button" onClick={() => { setEditingTestimonial(null); setTestimonialForm({ name: '', text: '' }); }} className="text-xs text-yellow-200 mt-1 underline">Cancel Edit</button>
                )}
              </form>
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full border border-yellow-900 bg-black/40">
                  <thead>
                    <tr className="text-yellow-300">
                      <th className="p-2 border-b border-yellow-900">Name</th>
                      <th className="p-2 border-b border-yellow-900">Testimonial</th>
                      <th className="p-2 border-b border-yellow-900">Date</th>
                      <th className="p-2 border-b border-yellow-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map(t => (
                      <tr key={t.id} className="text-yellow-50">
                        <td className="p-2 border-b border-yellow-900 font-bold">{t.name}</td>
                        <td className="p-2 border-b border-yellow-900">{t.text}</td>
                        <td className="p-2 border-b border-yellow-900">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-2 border-b border-yellow-900 flex gap-2">
                          <button onClick={() => handleEditTestimonial(t)} className="px-2 py-1 rounded bg-yellow-300 text-yellow-900 font-bold hover:bg-yellow-400 transition text-xs flex items-center gap-1"><FaEdit /> Edit</button>
                          <button onClick={() => handleDeleteTestimonial(t.id)} className="px-2 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-700 transition text-xs flex items-center gap-1"><FaTrash /> Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {testimonials.length === 0 && <div className="text-yellow-200 mt-4">No testimonials yet.</div>}
              </div>
            </div>
          )}
          {section === "Messages" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-yellow-300">Message Management</h2>
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full border border-yellow-900 bg-black/40">
                  <thead>
                    <tr className="text-yellow-300">
                      <th className="p-2 border-b border-yellow-900">Name</th>
                      <th className="p-2 border-b border-yellow-900">Email</th>
                      <th className="p-2 border-b border-yellow-900">Message</th>
                      <th className="p-2 border-b border-yellow-900">Date</th>
                      <th className="p-2 border-b border-yellow-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <tr key={msg.id} className="text-yellow-50">
                        <td className="p-2 border-b border-yellow-900 font-bold">{msg.name}</td>
                        <td className="p-2 border-b border-yellow-900">{msg.email}</td>
                        <td className="p-2 border-b border-yellow-900">{msg.message}</td>
                        <td className="p-2 border-b border-yellow-900">{msg.date}</td>
                        <td className="p-2 border-b border-yellow-900 flex gap-2">
                          <button onClick={() => handleDeleteMessage(msg.id)} className="px-2 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-700 transition text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {messages.length === 0 && <div className="text-yellow-200 mt-4">No messages yet.</div>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 