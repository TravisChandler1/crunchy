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
  items: { 
    items: { name: string; quantity: number; price: string }[];
    total: number;
    email: string;
    address: string;
    delivery?: {
      isDelivery: boolean;
      address: string;
      coordinates: { lat: number; lng: number } | null;
      deliveryCharge: number;
    };
  };
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [useImageUpload, setUseImageUpload] = useState(true);
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
        { 
          id: '1', 
          customer: 'John Doe', 
          items: { 
            items: [{ name: 'Ripe Plantain Chips', quantity: 2, price: '₦4,500' }],
            total: 9000,
            email: 'john@example.com',
            address: '123 Sample St, Lagos',
            delivery: {
              isDelivery: true,
              address: '123 Sample St, Lagos',
              coordinates: { lat: 6.5244, lng: 3.3792 },
              deliveryCharge: 1000
            }
          }, 
          status: 'pending', 
          date: '2024-06-01', 
          phone: '+2348012345678' 
        },
        { 
          id: '2', 
          customer: 'Jane Smith', 
          items: { 
            items: [{ name: 'Unripe Plantain Chips', quantity: 1, price: '₦4,500' }],
            total: 4500,
            email: 'jane@example.com',
            address: '456 Test Ave, Abuja',
            delivery: {
              isDelivery: true,
              address: '456 Test Ave, Abuja',
              coordinates: { lat: 9.0579, lng: 7.4951 },
              deliveryCharge: 1500
            }
          }, 
          status: 'fulfilled', 
          date: '2024-06-02', 
          phone: '+2348012345679' 
        },
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProductForm({ ...productForm, image: data.filename });
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
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

  // Add helper to get week range (Sunday to next Monday)
  function getWeekRange() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(sunday);
    nextMonday.setDate(sunday.getDate() + 8); // next week's Monday 00:00
    nextMonday.setHours(0, 0, 0, 0);
    return { start: sunday, end: nextMonday };
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#7ed957]">
        <div className="glass-card p-8 rounded-2xl shadow-lg border border-[#7ed957] flex flex-col items-center max-w-xs w-full">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[#7ed957] text-[#7ed957] bg-white focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
              required
            />
            <button type="submit" className="px-6 py-2 rounded-full bg-[#7ed957] text-[#45523e] font-bold shadow hover:bg-[#45523e] hover:text-white transition">Login</button>
            {error && <div className="text-red-500 text-center font-bold">{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#7ed957] flex flex-col">
      <header className="w-full bg-[#7ed957] text-white py-6 px-8 flex items-center justify-between shadow">
        <h1 className="text-2xl font-bold tracking-wide">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full bg-[#7ed957] text-[#45523e] hover:bg-[#45523e] hover:text-white transition border border-[#7ed957] shadow flex items-center justify-center" title="Go to Homepage">
            <FaHome className="text-2xl" />
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-black text-[#7ed957] font-bold border border-[#7ed957] hover:bg-[#7ed957] hover:text-white transition">Logout</button>
        </div>
      </header>
      <div className="flex flex-1 min-h-screen">
        <nav className={`transition-all duration-300 bg-black/80 border-r border-[#7ed957] flex flex-col gap-2 py-8 px-2 h-screen ${sidebarOpen ? "w-56" : "w-14"}`} style={{ minWidth: sidebarOpen ? 224 : 56 }}>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="mb-4 p-2 rounded-full bg-[#7ed957] text-[#45523e] font-bold shadow hover:bg-[#45523e] hover:text-white transition self-end"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          {sections.map((s, i) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex items-center gap-2 text-left px-2 py-2 rounded-lg font-semibold transition w-full ${section === s ? "bg-[#7ed957] text-white" : "hover:bg-[#7ed957]/30 text-[#7ed957]"}`}
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
              <h2 className="text-xl font-bold mb-2 text-[#7ed957]">Welcome, Olayinka!</h2>
              <p className="text-[#7ed957] mb-4">Here&apos;s a summary of everything that went down this week:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957] flex flex-col items-center">
                  <span className="text-3xl font-bold text-[#7ed957] mb-1">{products.length}</span>
                  <span className="text-[#7ed957]">Products Added</span>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957] flex flex-col items-center">
                  {/* Only orders from this week (Sunday to next Monday) */}
                  <span className="text-3xl font-bold text-[#7ed957] mb-1">{
                    (() => {
                      const { start, end } = getWeekRange();
                      return orders.filter(o => {
                        const d = new Date(o.date);
                        return d >= start && d < end;
                      }).length;
                    })()
                  }</span>
                  <span className="text-[#7ed957]">Orders Placed</span>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957] flex flex-col items-center">
                  {/* Only testimonials from this week */}
                  <span className="text-3xl font-bold text-[#7ed957] mb-1">{
                    (() => {
                      const { start, end } = getWeekRange();
                      return testimonials.filter(t => {
                        const d = new Date(t.date);
                        return d >= start && d < end;
                      }).length;
                    })()
                  }</span>
                  <span className="text-[#7ed957]">Testimonials Received</span>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957] flex flex-col items-center">
                  {/* Only messages from this week */}
                  <span className="text-3xl font-bold text-[#7ed957] mb-1">{
                    (() => {
                      const { start, end } = getWeekRange();
                      return messages.filter(m => {
                        const d = new Date(m.date);
                        return d >= start && d < end;
                      }).length;
                    })()
                  }</span>
                  <span className="text-[#7ed957]">Messages Received</span>
                </div>
              </div>
              <p className="text-[#7ed957]">Use the navigation to manage products, orders, testimonials, and messages.</p>
            </div>
          )}
          {section === "Products" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#7ed957]">Product Management</h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold text-[#7ed957]">Ordering:</span>
                <button
                  onClick={handleToggleOrdering}
                  className={`px-4 py-2 rounded-full font-bold shadow border transition ${orderingEnabled ? "bg-[#7ed957] text-white border-[#7ed957]" : "bg-red-600 text-white border-red-700"}`}
                  disabled={orderingLoading}
                >
                  {orderingEnabled ? "Enabled" : "Disabled"}
                </button>
                {orderingLoading && <span className="text-[#7ed957] ml-2">Saving...</span>}
              </div>
              <form onSubmit={handleAddOrEditProduct} className="mb-8 flex flex-col gap-3 bg-black/30 p-4 rounded-xl border border-[#7ed957] max-w-lg">
                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                  placeholder="Product Name"
                  required
                  className="px-3 py-2 rounded border border-[#7ed957] bg-black/10 text-[#7ed957]"
                />
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  placeholder="Description"
                  required
                  className="px-3 py-2 rounded border border-[#7ed957] bg-black/10 text-[#7ed957]"
                />
                <input
                  name="price"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                  placeholder="Price (e.g. ₦4,500)"
                  required
                  className="px-3 py-2 rounded border border-[#7ed957] bg-black/10 text-[#7ed957]"
                />
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setUseImageUpload(true)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${useImageUpload ? 'bg-[#7ed957] text-[#45523e]' : 'bg-gray-600 text-white'}`}
                    >
                      Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseImageUpload(false)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${!useImageUpload ? 'bg-[#7ed957] text-[#45523e]' : 'bg-gray-600 text-white'}`}
                    >
                      Image URL
                    </button>
                  </div>
                  
                  {useImageUpload ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full px-3 py-2 rounded border border-[#7ed957] bg-black/10 text-[#7ed957] file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#7ed957] file:text-[#45523e] hover:file:bg-[#45523e] hover:file:text-white"
                      />
                      {uploadingImage && (
                        <div className="text-[#7ed957] text-xs mt-1">Uploading image...</div>
                      )}
                    </div>
                  ) : (
                    <input
                      name="image"
                      value={productForm.image}
                      onChange={handleProductFormChange}
                      placeholder="Image URL"
                      required
                      className="px-3 py-2 rounded border border-[#7ed957] bg-black/10 text-[#7ed957] w-full"
                    />
                  )}
                  
                  {productForm.image && (
                    <div className="mt-2">
                      <div className="text-xs text-[#7ed957] mb-1">Preview:</div>
                      <Image 
                        src={productForm.image} 
                        alt="Product preview" 
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded border border-[#7ed957]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <button type="submit" className="px-4 py-2 rounded-full bg-[#7ed957] text-[#45523e] font-bold shadow hover:bg-[#45523e] transition">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: '', image: '' }); }} className="text-xs text-[#7ed957] mt-1 underline">Cancel Edit</button>
                )}
              </form>
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full border border-[#7ed957] bg-black/40">
                  <thead>
                    <tr className="text-[#7ed957]">
                      <th className="p-2 border-b border-[#7ed957]">Image</th>
                      <th className="p-2 border-b border-[#7ed957]">Name</th>
                      <th className="p-2 border-b border-[#7ed957]">Description</th>
                      <th className="p-2 border-b border-[#7ed957]">Price</th>
                      <th className="p-2 border-b border-[#7ed957]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="text-[#7ed957]">
                        <td className="p-2 border-b border-[#7ed957]"><Image src={product.image} alt={product.name} width={64} height={64} className="w-16 h-16 object-cover rounded" /></td>
                        <td className="p-2 border-b border-[#7ed957] font-bold">{product.name}</td>
                        <td className="p-2 border-b border-[#7ed957]">{product.description}</td>
                        <td className="p-2 border-b border-[#7ed957]">{product.price}</td>
                        <td className="p-2 border-b border-[#7ed957] flex gap-2 items-center">
                          <button onClick={() => handleEditProduct(product)} className="px-2 py-1 rounded bg-[#7ed957] text-[#45523e] font-bold hover:bg-[#45523e] transition text-xs">Edit</button>
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
                            className={`px-2 py-1 rounded font-bold text-xs transition ${product.available ? 'bg-[#7ed957] text-[#45523e] hover:bg-[#45523e]' : 'bg-gray-400 text-gray-900 hover:bg-gray-500'}`}
                          >
                            {product.available ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && <div className="text-[#7ed957] mt-4">No products yet.</div>}
              </div>
            </div>
          )}
          {section === "Orders" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#7ed957]">Order Management</h2>
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full border border-[#7ed957] bg-black/40">
                  <thead>
                    <tr className="text-[#7ed957]">
                      <th className="p-2 border-b border-[#7ed957]">Customer</th>
                      <th className="p-2 border-b border-[#7ed957]">Items</th>
                      <th className="p-2 border-b border-[#7ed957]">Delivery</th>
                      <th className="p-2 border-b border-[#7ed957]">Status</th>
                      <th className="p-2 border-b border-[#7ed957]">Date</th>
                      <th className="p-2 border-b border-[#7ed957]">Phone</th>
                      <th className="p-2 border-b border-[#7ed957]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      // Handle both old and new order formats
                      const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      const items = orderItems.items || order.items;
                      const delivery = orderItems.delivery;
                      
                      return (
                        <tr key={order.id} className="text-[#7ed957]">
                          <td className="p-2 border-b border-[#7ed957] font-bold">{order.customer}</td>
                          <td className="p-2 border-b border-[#7ed957]">
                            <ul>
                              {Array.isArray(items) ? items.map((item: { name: string; quantity: number; price: number }, idx: number) => (
                                <li key={idx}>{item.name} x{item.quantity} <span className="text-[#7ed957]">₦{item.price * item.quantity}</span></li>
                              )) : (
                                <li>Invalid order format</li>
                              )}
                            </ul>
                            {orderItems.total && (
                              <div className="font-bold mt-1">Total: ₦{orderItems.total}</div>
                            )}
                          </td>
                          <td className="p-2 border-b border-[#7ed957]">
                            {delivery ? (
                              delivery.isDelivery ? (
                                <div>
                                  <div className="text-xs font-bold text-[#7ed957]">Delivery</div>
                                  <div className="text-xs">{delivery.address}</div>
                                  <div className="text-xs font-bold">₦{delivery.deliveryCharge}</div>
                                </div>
                              ) : (
                                <div className="text-xs font-bold text-yellow-500">Pickup</div>
                              )
                            ) : (
                              <div className="text-xs text-gray-500">Not specified</div>
                            )}
                          </td>
                          <td className="p-2 border-b border-[#7ed957]">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'fulfilled' ? 'bg-[#7ed957]' : order.status === 'cancelled' ? 'bg-red-600' : 'bg-yellow-700'} text-white`}>{order.status}</span>
                          </td>
                          <td className="p-2 border-b border-[#7ed957]">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="p-2 border-b border-[#7ed957]">{order.phone}</td>
                          <td className="p-2 border-b border-[#7ed957] flex gap-2">
                            {order.status !== 'fulfilled' && (
                              <button onClick={() => handleOrderStatus(order.id, 'fulfilled')} className="px-2 py-1 rounded bg-[#7ed957] text-white font-bold hover:bg-[#45523e] transition text-xs">Mark Fulfilled</button>
                            )}
                            {order.status !== 'cancelled' && (
                              <button onClick={() => handleOrderStatus(order.id, 'cancelled')} className="px-2 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-700 transition text-xs">Cancel</button>
                            )}
                            <button onClick={() => handleDeleteOrder(order.id)} className="px-2 py-1 rounded bg-[#7ed957] text-[#45523e] font-bold hover:bg-[#45523e] transition text-xs">Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {orders.length === 0 && <div className="text-[#7ed957] mt-4">No orders yet.</div>}
              </div>
            </div>
          )}
          {section === "Testimonials" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#7ed957]">Testimonial Management</h2>
              <form onSubmit={handleAddOrEditTestimonial} className="mb-8 flex flex-col gap-3 bg-black/30 p-4 rounded-xl border border-[#7ed957] max-w-lg">
                <input
                  name="name"
                  value={testimonialForm.name}
                  onChange={handleTestimonialFormChange}
                  placeholder="Customer Name"
                  required
                  className="px-3 py-2 rounded border border-[#7ed957] bg-black/10 text-[#7ed957]"
                />
                <textarea
                  name="text"
                  value={testimonialForm.text}
                  onChange={handleTestimonialFormChange}
                  placeholder="Testimonial Text"
                  required
                  className="px-3 py-2 rounded border border-[#7ed957] bg-black/10 text-[#7ed957]"
                />
                <button type="submit" className="px-4 py-2 rounded-full bg-[#7ed957] text-[#45523e] font-bold shadow hover:bg-[#45523e] transition">
                  {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
                {editingTestimonial && (
                  <button type="button" onClick={() => { setEditingTestimonial(null); setTestimonialForm({ name: '', text: '' }); }} className="text-xs text-[#7ed957] mt-1 underline">Cancel Edit</button>
                )}
              </form>
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full border border-[#7ed957] bg-black/40">
                  <thead>
                    <tr className="text-[#7ed957]">
                      <th className="p-2 border-b border-[#7ed957]">Name</th>
                      <th className="p-2 border-b border-[#7ed957]">Testimonial</th>
                      <th className="p-2 border-b border-[#7ed957]">Date</th>
                      <th className="p-2 border-b border-[#7ed957]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map(t => (
                      <tr key={t.id} className="text-[#7ed957]">
                        <td className="p-2 border-b border-[#7ed957] font-bold">{t.name}</td>
                        <td className="p-2 border-b border-[#7ed957]">{t.text}</td>
                        <td className="p-2 border-b border-[#7ed957]">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-2 border-b border-[#7ed957] flex gap-2">
                          <button onClick={() => handleEditTestimonial(t)} className="px-2 py-1 rounded bg-[#7ed957] text-[#45523e] font-bold hover:bg-[#45523e] transition text-xs flex items-center gap-1"><FaEdit /> Edit</button>
                          <button onClick={() => handleDeleteTestimonial(t.id)} className="px-2 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-700 transition text-xs flex items-center gap-1"><FaTrash /> Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {testimonials.length === 0 && <div className="text-[#7ed957] mt-4">No testimonials yet.</div>}
              </div>
            </div>
          )}
          {section === "Messages" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#7ed957]">Message Management</h2>
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full border border-[#7ed957] bg-black/40">
                  <thead>
                    <tr className="text-[#7ed957]">
                      <th className="p-2 border-b border-[#7ed957]">Name</th>
                      <th className="p-2 border-b border-[#7ed957]">Email</th>
                      <th className="p-2 border-b border-[#7ed957]">Message</th>
                      <th className="p-2 border-b border-[#7ed957]">Date</th>
                      <th className="p-2 border-b border-[#7ed957]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <tr key={msg.id} className="text-[#7ed957]">
                        <td className="p-2 border-b border-[#7ed957] font-bold">{msg.name}</td>
                        <td className="p-2 border-b border-[#7ed957]">{msg.email}</td>
                        <td className="p-2 border-b border-[#7ed957]">{msg.message}</td>
                        <td className="p-2 border-b border-[#7ed957]">{msg.date}</td>
                        <td className="p-2 border-b border-[#7ed957] flex gap-2">
                          <button onClick={() => handleDeleteMessage(msg.id)} className="px-2 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-700 transition text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {messages.length === 0 && <div className="text-[#7ed957] mt-4">No messages yet.</div>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 