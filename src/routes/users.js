const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        createdAt: true,
        dailyUsage: true,
        monthlyUsage: true,
        lastUsageDate: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get usage statistics
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        dailyUsage: true,
        monthlyUsage: true,
        lastUsageDate: true,
        isPremium: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date().toDateString();
    const isNewDay = !user.lastUsageDate || user.lastUsageDate.toDateString() !== today;

    res.json({
      success: true,
      usage: {
        dailyUsage: isNewDay ? 0 : user.dailyUsage,
        monthlyUsage: user.monthlyUsage,
        dailyLimit: user.isPremium ? 100 : 10,
        monthlyLimit: user.isPremium ? 3000 : 300,
        isPremium: user.isPremium,
        lastUsageDate: user.lastUsageDate
      }
    });

  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upgrade to premium (placeholder for Stripe integration)
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, this would:
    // 1. Verify the payment with Stripe
    // 2. Update the user's subscription status
    // 3. Set isPremium to true

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isPremium: true
      }
    });

    res.json({
      success: true,
      message: 'Successfully upgraded to premium',
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.isPremium
      }
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/downgrade', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, this would:
    // 1. Cancel the Stripe subscription
    // 2. Set isPremium to false
    // 3. Reset usage limits

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isPremium: false,
        stripeSubscriptionId: null
      }
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.isPremium
      }
    });

  } catch (error) {
    console.error('Downgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
