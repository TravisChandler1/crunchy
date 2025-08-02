// Database configuration and connection
// This is a template - you'll need to replace with your actual database setup

import { Pool } from 'pg'; // For PostgreSQL
// import mysql from 'mysql2/promise'; // For MySQL
// import sqlite3 from 'sqlite3'; // For SQLite

// PostgreSQL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Database schema creation scripts
export const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(50) NOT NULL,
        image VARCHAR(500),
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        items JSONB NOT NULL,
        total_amount INTEGER NOT NULL,
        delivery_info JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        payment_reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_tracking (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        message TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Testimonials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255),
        customer_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        helpful_count INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        action_url VARCHAR(500),
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Database query helpers
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Product operations
export const productQueries = {
  getAll: () => query('SELECT * FROM products ORDER BY created_at DESC'),
  getById: (id: string) => query('SELECT * FROM products WHERE id = $1', [id]),
  create: (product: any) => query(
    'INSERT INTO products (name, description, price, image, available) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [product.name, product.description, product.price, product.image, product.available ?? true]
  ),
  update: (id: string, product: any) => query(
    'UPDATE products SET name = $1, description = $2, price = $3, image = $4, available = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
    [product.name, product.description, product.price, product.image, product.available, id]
  ),
  delete: (id: string) => query('DELETE FROM products WHERE id = $1', [id])
};

// Order operations
export const orderQueries = {
  getAll: () => query('SELECT * FROM orders ORDER BY created_at DESC'),
  getById: (id: string) => query('SELECT * FROM orders WHERE id = $1', [id]),
  create: (order: any) => query(
    'INSERT INTO orders (customer_name, customer_email, customer_phone, items, total_amount, delivery_info, payment_reference) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [order.customer, order.email, order.phone, JSON.stringify(order.items), order.total, JSON.stringify(order.delivery), order.paymentReference]
  ),
  updateStatus: (id: string, status: string) => query(
    'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  ),
  delete: (id: string) => query('DELETE FROM orders WHERE id = $1', [id])
};

// Tracking operations
export const trackingQueries = {
  getByOrderId: (orderId: string) => query(
    'SELECT * FROM order_tracking WHERE order_id = $1 ORDER BY created_at ASC',
    [orderId]
  ),
  addUpdate: (orderId: string, status: string, message: string, location?: string) => query(
    'INSERT INTO order_tracking (order_id, status, message, location) VALUES ($1, $2, $3, $4) RETURNING *',
    [orderId, status, message, location]
  )
};

// Testimonial operations
export const testimonialQueries = {
  getAll: () => query('SELECT * FROM testimonials ORDER BY created_at DESC'),
  create: (testimonial: any) => query(
    'INSERT INTO testimonials (name, text, rating, verified) VALUES ($1, $2, $3, $4) RETURNING *',
    [testimonial.name, testimonial.text, testimonial.rating ?? 5, testimonial.verified ?? false]
  ),
  update: (id: string, testimonial: any) => query(
    'UPDATE testimonials SET name = $1, text = $2, rating = $3 WHERE id = $4 RETURNING *',
    [testimonial.name, testimonial.text, testimonial.rating, id]
  ),
  delete: (id: string) => query('DELETE FROM testimonials WHERE id = $1', [id])
};

// Message operations
export const messageQueries = {
  getAll: () => query('SELECT * FROM messages ORDER BY created_at DESC'),
  create: (message: any) => query(
    'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *',
    [message.name, message.email, message.message]
  ),
  markAsRead: (id: string) => query('UPDATE messages SET read = true WHERE id = $1', [id]),
  delete: (id: string) => query('DELETE FROM messages WHERE id = $1', [id])
};

// Feedback operations
export const feedbackQueries = {
  getAll: () => query('SELECT * FROM feedback ORDER BY created_at DESC'),
  create: (feedback: any) => query(
    'INSERT INTO feedback (order_id, customer_name, rating, comment, category, verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [feedback.orderId, feedback.customerName, feedback.rating, feedback.comment, feedback.category, feedback.verified ?? false]
  ),
  incrementHelpful: (id: string) => query(
    'UPDATE feedback SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING *',
    [id]
  )
};

// Notification operations
export const notificationQueries = {
  getAll: () => query('SELECT * FROM notifications ORDER BY created_at DESC'),
  create: (notification: any) => query(
    'INSERT INTO notifications (type, title, message, action_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [notification.type, notification.title, notification.message, notification.actionUrl]
  ),
  markAsRead: (id: string) => query('UPDATE notifications SET read = true WHERE id = $1', [id]),
  delete: (id: string) => query('DELETE FROM notifications WHERE id = $1', [id])
};

// Settings operations
export const settingsQueries = {
  get: (key: string) => query('SELECT value FROM settings WHERE key = $1', [key]),
  set: (key: string, value: any) => query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP RETURNING *',
    [key, JSON.stringify(value)]
  )
};

export default pool;