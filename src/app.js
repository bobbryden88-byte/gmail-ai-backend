const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Handle uncaught errors gracefully for Vercel
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

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
    
    // Allow Chrome extensions
    if (origin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }
    
    // Allow localhost
    if (origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin === 'http://localhost:3000') {
      return callback(null, true);
    }
    
    // Allow Gmail (for content scripts)
    if (origin.includes('mail.google.com') || origin.includes('gmail.com')) {
      return callback(null, true);
    }
    
    // Allow same-origin requests (for password reset page)
    if (origin && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // In production, you might want to restrict this
    if (process.env.NODE_ENV === 'production') {
      // In production, be more permissive for Chrome extensions
      // Chrome extensions can make requests from any page
      console.log('CORS: Allowing request from:', origin);
      return callback(null, true);
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

// Login page
app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, '..', 'public') });
});

// Password reset page
app.get('/reset-password', (req, res) => {
  res.sendFile('reset-password.html', { root: path.join(__dirname, '..', 'public') });
});

// Privacy policy page
app.get('/privacy-policy', (req, res) => {
  res.sendFile('privacy-policy.html', { root: path.join(__dirname, '..', 'public') });
});

// Health check (no database required)
app.get('/health', (req, res) => {
  try {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: !!process.env.VERCEL
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Export app for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints:`);
    console.log(`   - POST /api/auth/register`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - GET  /api/auth/verify`);
    console.log(`🤖 AI endpoints:`);
    console.log(`   - POST /api/ai/generate (requires auth)`);
    console.log(`   - GET  /api/ai/usage`);
    console.log(`💳 Stripe endpoints:`);
    console.log(`   - GET  /api/stripe/pricing`);
    console.log(`   - POST /api/stripe/create-checkout-session`);
    console.log(`   - POST /api/stripe/success`);
    console.log(`   - POST /api/stripe/cancel-subscription`);
    console.log(`   - GET  /api/stripe/subscription-status`);
  });
}
