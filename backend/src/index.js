const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productsRoutes = require('./routes/productsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const couponsRoutes = require('./routes/couponsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const { handlePaymentWebhook } = require('./services/paymentService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://localhost:3007',
      'http://192.168.18.9:3000',
      'http://192.168.18.9:3001',
      'http://192.168.18.9:3002',
      'http://192.168.18.9:3003',
      'http://192.168.18.9:3004',
      'http://192.168.18.9:3005',
      'http://192.168.18.9:3006',
      'http://192.168.18.9:3007',
      'https://floreria-murex.vercel.app',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/reports', reportsRoutes);

// Webhook endpoints (should validate with payment provider in production)
app.post('/api/webhooks/yape', async (req, res) => {
  try {
    const result = await handlePaymentWebhook(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Webhook processing failed',
    });
  }
});

app.post('/api/webhooks/plin', async (req, res) => {
  try {
    const result = await handlePaymentWebhook(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Webhook processing failed',
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
