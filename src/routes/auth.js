const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
const { verifyGoogleToken } = require('../services/google-auth');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register new user
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || '',
        password: hashedPassword,
        isPremium: false,
        dailyUsage: 0,
        monthlyUsage: 0
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        isPremium: user.isPremium 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log(`✅ New user registered: ${user.email} (ID: ${user.id})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log(`Login attempt for non-existent user: ${email.toLowerCase()}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user has a password (might have been created via Google OAuth)
    if (!user.password) {
      console.log(`Login attempt for Google OAuth user (no password): ${user.email}`);
      return res.status(401).json({ 
        error: 'This account was created with Google Sign-In. Please use "Sign in with Google" instead.',
        useGoogleSignIn: true
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        isPremium: user.isPremium 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log(`✅ User logged in: ${user.email} (ID: ${user.id})`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        dailyUsage: user.dailyUsage,
        monthlyUsage: user.monthlyUsage
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Prisma')) {
      return res.status(500).json({ error: 'Database connection error. Please try again later.' });
    }
    
    res.status(500).json({ error: 'Failed to login. Please try again.' });
  }
});

// Google OAuth authentication
router.post('/google', async (req, res) => {
  try {
    console.log('Google OAuth request received:', {
      hasIdToken: !!req.body.idToken,
      hasEmail: !!req.body.email,
      hasGoogleId: !!req.body.googleId,
      email: req.body.email
    });

    const { idToken, email, googleId, name, picture } = req.body;

    let googleUser;

    // Support both ID token (for web apps) and direct user info (for Chrome extensions)
    if (idToken) {
      // Verify Google ID token
      try {
        googleUser = await verifyGoogleToken(idToken);
        console.log('Google token verified successfully');
      } catch (tokenError) {
        console.error('Google token verification failed:', tokenError);
        return res.status(401).json({ 
          error: 'Failed to verify Google token',
          details: tokenError.message 
        });
      }
    } else if (email && googleId) {
      // Direct user info from Chrome extension (using access token to get user info)
      console.log('Using direct user info (no token verification)');
      googleUser = {
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        googleId: googleId,
        picture: picture
      };
    } else {
      console.error('Missing required fields for Google OAuth');
      return res.status(400).json({ 
        error: 'Either Google ID token or email and Google ID are required',
        received: { hasIdToken: !!idToken, hasEmail: !!email, hasGoogleId: !!googleId }
      });
    }
    
    if (!googleUser.email || !googleUser.googleId) {
      console.error('Invalid googleUser object:', googleUser);
      return res.status(400).json({ error: 'Email and Google ID are required' });
    }

    console.log('Processing Google OAuth for user:', googleUser.email);

    // Find existing user by email or googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: googleUser.email },
          { googleId: googleUser.googleId }
        ]
      }
    });

    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId || user.googleId !== googleUser.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.googleId,
            authProvider: 'google',
            // Update name if not set
            name: user.name || googleUser.name
          }
        });
      }
      
      // If user was created with email/password, link Google account
      if (user.authProvider !== 'google') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.googleId,
            authProvider: 'google' // Allow both methods
          }
        });
      }
      
      console.log(`✅ User logged in via Google: ${user.email} (ID: ${user.id})`);
    } else {
      // New user - create account
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          authProvider: 'google',
          password: null, // Google users don't have passwords
          isPremium: false,
          dailyUsage: 0,
          monthlyUsage: 0
        }
      });
      
      console.log(`✅ New user registered via Google: ${user.email} (ID: ${user.id})`);
    }

    // Generate JWT token (same format as email/password login)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        isPremium: user.isPremium 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        dailyUsage: user.dailyUsage || 0,
        monthlyUsage: user.monthlyUsage || 0
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      error: 'Failed to authenticate with Google',
      details: error.message 
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium
      }
    });

  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

module.exports = router;
