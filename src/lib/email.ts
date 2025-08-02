// Email marketing and notification service
import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Send email
export const sendEmail = async ({ to, subject, html, text }: EmailMessage) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Crunchy Cruise Snacks" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderData: any) => ({
    subject: `Order Confirmation - ${orderData.orderRef}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7ed957; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
          .button { display: inline-block; background: #7ed957; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! 🎉</h1>
            <p>Thank you for choosing Crunchy Cruise Snacks</p>
          </div>
          <div class="content">
            <h2>Hi ${orderData.customerName}!</h2>
            <p>Your order has been confirmed and we're preparing your delicious plantain chips.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Reference:</strong> ${orderData.orderRef}</p>
              <p><strong>Total Amount:</strong> ₦${orderData.total.toLocaleString()}</p>
              <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress || 'Store Pickup'}</p>
              
              <h4>Items Ordered:</h4>
              <ul>
                ${orderData.items.map((item: any) => 
                  `<li>${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}</li>`
                ).join('')}
              </ul>
            </div>
            
            <p>We'll send you updates as your order progresses. You can also track your order anytime:</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track?ref=${orderData.orderRef}" class="button">Track Your Order</a>
            
            <p><em>"As you dey crunch, just dey cruise!"</em></p>
          </div>
          <div class="footer">
            <p>Crunchy Cruise Snacks | Premium Plantain Chips</p>
            <p>Contact us: ${process.env.SUPPORT_EMAIL || 'support@crunchycruise.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderStatusUpdate: (orderData: any, status: string, message: string) => ({
    subject: `Order Update - ${orderData.orderRef}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7ed957; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .status-update { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #7ed957; }
          .button { display: inline-block; background: #7ed957; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update 📦</h1>
            <p>Your Crunchy Cruise order has been updated</p>
          </div>
          <div class="content">
            <h2>Hi ${orderData.customerName}!</h2>
            
            <div class="status-update">
              <h3>Status: ${status.toUpperCase()}</h3>
              <p>${message}</p>
              <p><strong>Order Reference:</strong> ${orderData.orderRef}</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track?ref=${orderData.orderRef}" class="button">Track Your Order</a>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  newsletter: (content: any) => ({
    subject: content.subject || 'Latest from Crunchy Cruise Snacks',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7ed957; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .offer { background: #45523e; color: white; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .button { display: inline-block; background: #7ed957; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${content.title || 'Crunchy Cruise Newsletter'}</h1>
            <p>Premium Plantain Chips & More</p>
          </div>
          <div class="content">
            ${content.body}
            
            ${content.offer ? `
              <div class="offer">
                <h3>🎉 Special Offer!</h3>
                <p>${content.offer}</p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/products" class="button">Shop Now</a>
              </div>
            ` : ''}
            
            <p><em>"As you dey crunch, just dey cruise!"</em></p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  welcomeEmail: (customerName: string) => ({
    subject: 'Welcome to Crunchy Cruise Snacks! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7ed957; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .welcome-offer { background: #45523e; color: white; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .button { display: inline-block; background: #7ed957; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Crunchy Cruise! 🎉</h1>
            <p>Premium Plantain Chips Delivered Fresh</p>
          </div>
          <div class="content">
            <h2>Hi ${customerName}!</h2>
            <p>Welcome to the Crunchy Cruise family! We're excited to have you on board.</p>
            
            <p>At Crunchy Cruise Snacks, we're passionate about delivering the finest plantain chips made from fresh, natural ingredients. Whether you prefer our sweet ripe plantain chips or our savory unripe variety, we've got something delicious waiting for you.</p>
            
            <div class="welcome-offer">
              <h3>🎁 Welcome Offer!</h3>
              <p>Get 10% off your first order with code: <strong>WELCOME10</strong></p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/products" class="button">Start Shopping</a>
            </div>
            
            <h3>What makes us special:</h3>
            <ul>
              <li>🌱 100% natural ingredients</li>
              <li>🚚 Fast delivery across Lagos</li>
              <li>✅ NAFDAC approved</li>
              <li>��� Beautiful packaging</li>
              <li>⭐ Premium quality guaranteed</li>
            </ul>
            
            <p>Ready to start crunching? Browse our products and place your first order today!</p>
            
            <p><em>"As you dey crunch, just dey cruise!"</em></p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (orderData: any) => {
  const template = emailTemplates.orderConfirmation(orderData);
  return await sendEmail({
    to: orderData.customerEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send order status update email
export const sendOrderStatusEmail = async (orderData: any, status: string, message: string) => {
  const template = emailTemplates.orderStatusUpdate(orderData, status, message);
  return await sendEmail({
    to: orderData.customerEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send welcome email
export const sendWelcomeEmail = async (customerEmail: string, customerName: string) => {
  const template = emailTemplates.welcomeEmail(customerName);
  return await sendEmail({
    to: customerEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send newsletter
export const sendNewsletter = async (recipients: string[], content: any) => {
  const template = emailTemplates.newsletter(content);
  return await sendEmail({
    to: recipients,
    subject: template.subject,
    html: template.html
  });
};

// Email list management
export const emailListManager = {
  // Add subscriber to mailing list
  addSubscriber: async (email: string, name?: string) => {
    // In a real app, you'd save this to your database
    // You could also integrate with services like Mailchimp, ConvertKit, etc.
    console.log('Adding subscriber:', email, name);
    
    // Send welcome email
    if (name) {
      await sendWelcomeEmail(email, name);
    }
    
    return { success: true };
  },

  // Remove subscriber
  removeSubscriber: async (email: string) => {
    console.log('Removing subscriber:', email);
    return { success: true };
  },

  // Send promotional campaign
  sendCampaign: async (subject: string, content: string, offer?: string) => {
    // In a real app, you'd fetch subscribers from your database
    const subscribers = ['customer1@example.com', 'customer2@example.com'];
    
    const template = emailTemplates.newsletter({
      subject,
      title: subject,
      body: content,
      offer
    });

    return await sendEmail({
      to: subscribers,
      subject: template.subject,
      html: template.html
    });
  }
};