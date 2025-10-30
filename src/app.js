const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/users');
const stripeRoutes = require('./routes/stripe');
const passwordResetRoutes = require('./routes/password-reset');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Chrome extensions and localhost
    if (origin.startsWith('chrome-extension://') || 
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin === 'http://localhost:3000') {
      return callback(null, true);
    }
    
    // Allow same-origin requests (for password reset page)
    if (origin && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // In production, you might want to restrict this
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }
    
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

app.use(express.json());

// Serve static files for payment pages
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes); // Add password reset routes to auth
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);

// Payment redirect pages
app.get('/payment-success', (req, res) => {
  res.sendFile('payment-success.html', { root: path.join(__dirname, '..', 'public') });
});

app.get('/payment-cancelled', (req, res) => {
  res.sendFile('payment-cancelled.html', { root: path.join(__dirname, '..', 'public') });
});

// Password reset page
app.get('/reset-password', (req, res) => {
  res.sendFile('reset-password.html', { root: path.join(__dirname, '..', 'public') });
});

// Privacy policy page
app.get('/privacy-policy', (req, res) => {
  res.sendFile('privacy-policy.html', { root: path.join(__dirname, '..', 'public') });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/verify`);
  console.log(`🤖 AI endpoints:`);
  console.log(`   - POST /api/ai/generate-test (no auth)`);
  console.log(`   - POST /api/ai/generate (requires auth)`);
  console.log(`   - GET  /api/ai/usage`);
  console.log(`💳 Stripe endpoints:`);
  console.log(`   - GET  /api/stripe/pricing`);
  console.log(`   - POST /api/stripe/create-checkout-session`);
  console.log(`   - POST /api/stripe/success`);
  console.log(`   - POST /api/stripe/cancel-subscription`);
  console.log(`   - GET  /api/stripe/subscription-status`);
});

module.exports = app;
