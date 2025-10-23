const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
const emailService = require('../services/email');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiter for password reset requests (3 per hour per IP)
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts. Please try again later.'
});

// POST /api/auth/forgot-password
router.post('/forgot-password', resetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔐 Password reset requested for:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user - but always return same response for security
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    if (user) {
      console.log('✅ User found, generating reset token');
      
      // Save token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiry: resetTokenExpiry
        }
      });

      console.log('📧 Sending reset email...');
      
      // Send reset email
      const emailResult = await emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken
      );

      if (emailResult.success) {
        console.log('✅ Reset email sent successfully');
        
        // In development, return the reset URL for testing
        if (!process.env.SMTP_USER && emailResult.resetUrl) {
          console.log('🔗 Reset URL (dev mode):', emailResult.resetUrl);
        }
      } else {
        console.error('❌ Failed to send email:', emailResult.error);
      }
    } else {
      console.log('⚠️  User not found, but returning success (security)');
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// GET /api/auth/verify-reset-token
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    console.log('🔍 Verifying reset token');

    if (!token) {
      return res.json({ valid: false, message: 'Token is required' });
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gte: new Date() // Token must not be expired
        }
      }
    });

    if (user) {
      console.log('✅ Token is valid');
      res.json({
        valid: true,
        message: 'Token is valid',
        email: user.email
      });
    } else {
      console.log('❌ Token is invalid or expired');
      res.json({
        valid: false,
        message: 'Token is invalid or has expired'
      });
    }

  } catch (error) {
    console.error('❌ Verify token error:', error);
    res.status(500).json({ valid: false, message: 'Failed to verify token' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log('🔐 Password reset attempt with token');

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gte: new Date()
        }
      }
    });

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    console.log('✅ Valid token found for user:', user.email);

    // Hash new password
    console.log('🔄 Hashing new password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null
      }
    });

    console.log('✅ Password updated successfully');

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
