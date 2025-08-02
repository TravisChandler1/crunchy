# Crunchy Cruise Snacks - Enhanced Setup Guide

This guide will help you set up all the new features including real-time notifications, order tracking, feedback system, analytics, and more.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:

- **Database**: PostgreSQL connection string
- **Paystack**: Payment processing keys
- **SMS**: Twilio or Termii credentials for SMS notifications
- **Email**: SMTP settings for email notifications
- **Maps**: Google Maps API key for delivery calculations

### 3. Database Setup

If using PostgreSQL, create your database and run:

```bash
# Initialize database tables
npm run db:setup
```

Or manually run the database setup:

```javascript
import { createTables } from './src/lib/database';
await createTables();
```

### 4. Start Development Server

```bash
npm run dev
```

## 🔧 Feature Configuration

### Real-Time Notifications

The notification system is automatically enabled. Features include:

- **Admin Notifications**: New orders, messages, feedback
- **Customer Notifications**: Order status updates
- **WebSocket Integration**: Real-time updates without page refresh

### Order Tracking

Customers can track orders at `/track` using their order reference. Features:

- **Real-time Status Updates**: Live tracking of order progress
- **SMS Notifications**: Automatic SMS updates for order status changes
- **Email Notifications**: Detailed email updates with tracking links

### Customer Feedback System

Available at `/feedback` with features:

- **Star Ratings**: 1-5 star rating system
- **Category-based Reviews**: Taste, delivery, packaging, overall
- **Helpful Voting**: Customers can mark reviews as helpful
- **Verified Purchases**: Reviews linked to actual orders

### Analytics Dashboard

Comprehensive business analytics including:

- **Revenue Tracking**: Daily, weekly, monthly revenue charts
- **Order Analytics**: Order volume, average order value
- **Customer Insights**: Satisfaction scores, retention rates
- **Performance Metrics**: Delivery performance, peak hours
- **Data Export**: CSV export functionality

### SMS Notifications

Automated SMS notifications for:

- Order confirmations
- Status updates (preparing, ready, out for delivery, delivered)
- Promotional offers
- Payment confirmations

### Email Marketing

Professional email templates for:

- Order confirmations with tracking links
- Status update notifications
- Welcome emails for new customers
- Newsletter campaigns
- Promotional offers

## 📱 Mobile Features

### Push Notifications (Optional)

To enable push notifications, configure Firebase:

1. Create a Firebase project
2. Add your Firebase config to `.env`
3. Enable FCM (Firebase Cloud Messaging)

### Progressive Web App (PWA)

The app includes PWA features:

- Offline functionality
- Add to home screen
- Push notifications
- Fast loading

## 🔐 Security Features

### Rate Limiting

API endpoints are protected with rate limiting:

- 100 requests per 15 minutes per IP
- Configurable in environment variables

### Data Validation

All inputs are validated:

- Email format validation
- Phone number validation
- SQL injection prevention
- XSS protection

## 📊 Analytics Integration

### Google Analytics (Optional)

Add your Google Analytics ID to `.env`:

```
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
```

### Custom Analytics

The built-in analytics dashboard provides:

- Real-time order tracking
- Revenue analytics
- Customer behavior insights
- Performance metrics

## 🚚 Delivery Features

### Distance Calculation

Automatic delivery charge calculation based on:

- Google Maps distance API
- Configurable pricing tiers
- Real-time address validation

### Delivery Tracking

Real-time delivery tracking with:

- GPS location updates
- Estimated delivery times
- Customer notifications

## 💳 Payment Integration

### Paystack Integration

Secure payment processing with:

- Card payments
- Bank transfers
- USSD payments
- Payment verification
- Webhook handling

## 🛠 Admin Features

### Enhanced Dashboard

- Real-time notifications
- Comprehensive analytics
- Order management
- Customer feedback monitoring
- Bulk operations

### Inventory Management

- Product availability toggle
- Stock level tracking
- Low stock alerts

## 📞 Customer Support

### Live Chat Support

AI-powered chat support with:

- FAQ responses
- Escalation to human support
- Order status queries
- Common questions handling

### Multi-channel Support

- WhatsApp integration
- Email support
- Phone support
- In-app messaging

## 🔄 Data Backup & Recovery

### Database Backups

Regular automated backups:

- Daily database snapshots
- File upload backups
- Configuration backups

### Disaster Recovery

- Automated failover
- Data replication
- Recovery procedures

## 📈 Performance Optimization

### Caching

- Redis caching for frequently accessed data
- Image optimization
- CDN integration

### Monitoring

- Error tracking with Sentry
- Performance monitoring
- Uptime monitoring

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   # Set production environment variables
   NODE_ENV=production
   ```

2. **Database Migration**:
   ```bash
   npm run db:migrate
   ```

3. **Build Application**:
   ```bash
   npm run build
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```

### Recommended Hosting

- **Vercel**: Easy deployment with automatic scaling
- **Railway**: Database and app hosting
- **DigitalOcean**: VPS with full control
- **AWS**: Enterprise-grade infrastructure

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**: Check DATABASE_URL in .env
2. **SMS Not Sending**: Verify Twilio/Termii credentials
3. **Email Issues**: Check SMTP settings
4. **Payment Failures**: Verify Paystack keys

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

## 📚 API Documentation

### Key Endpoints

- `GET /api/orders/track?ref=ORDER_REF` - Track order
- `POST /api/feedback` - Submit feedback
- `GET /api/analytics` - Get analytics data
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get notifications

### WebSocket Events

- `new-order` - New order placed
- `order-update` - Order status changed
- `new-message` - New customer message
- `new-feedback` - New customer feedback

## 🎯 Next Steps

After setup, consider:

1. **Customize Branding**: Update colors, logos, messaging
2. **Configure Integrations**: Set up all third-party services
3. **Test Features**: Thoroughly test all functionality
4. **Train Staff**: Ensure team knows how to use admin features
5. **Launch Marketing**: Use email and SMS features for promotion

## 📞 Support

For technical support or questions:

- Email: support@crunchycruise.com
- Documentation: Check inline code comments
- Issues: Create GitHub issues for bugs

---

**"As you dey crunch, just dey cruise!"** 🚀