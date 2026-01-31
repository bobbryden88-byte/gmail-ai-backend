const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Admin middleware - validates admin token
const adminAuth = (req, res, next) => {
  const adminToken = req.headers['x-admin-token'] || req.body.adminToken;

  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin token' });
  }

  next();
};

// POST /api/admin/upgrade - Manually upgrade a user to premium
router.post('/upgrade', adminAuth, async (req, res) => {
  try {
    const { email, userId, plan_type = 'monthly' } = req.body;

    if (!email && !userId) {
      return res.status(400).json({ error: 'Email or userId required' });
    }

    // Find user
    const whereClause = email ? { email } : { id: userId };
    const user = await prisma.user.findUnique({ where: whereClause });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Upgrade to premium
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        is_premium: true,
        plan_type: plan_type, // 'monthly' or 'yearly'
        subscription_status: 'active',
        // Set subscription end date 1 year from now for manual upgrades
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`[ADMIN] Upgraded user ${user.email} to ${plan_type} premium`);

    res.json({
      success: true,
      message: `User ${user.email} upgraded to ${plan_type} premium`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        is_premium: updatedUser.is_premium,
        plan_type: updatedUser.plan_type,
        subscription_status: updatedUser.subscription_status,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade user' });
  }
});

// POST /api/admin/downgrade - Remove premium from a user
router.post('/downgrade', adminAuth, async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email && !userId) {
      return res.status(400).json({ error: 'Email or userId required' });
    }

    const whereClause = email ? { email } : { id: userId };
    const user = await prisma.user.findUnique({ where: whereClause });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        is_premium: false,
        plan_type: null,
        subscription_status: 'cancelled',
        dailyUsage: 0, // Reset daily usage
      },
    });

    console.log(`[ADMIN] Downgraded user ${user.email} to free`);

    res.json({
      success: true,
      message: `User ${user.email} downgraded to free`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        is_premium: updatedUser.is_premium,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Downgrade error:', error);
    res.status(500).json({ error: 'Failed to downgrade user' });
  }
});

// GET /api/admin/user - Get user details
router.get('/user', adminAuth, async (req, res) => {
  try {
    const { email, userId } = req.query;

    if (!email && !userId) {
      return res.status(400).json({ error: 'Email or userId required' });
    }

    const whereClause = email ? { email } : { id: userId };
    const user = await prisma.user.findUnique({ where: whereClause });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        is_premium: user.is_premium,
        plan_type: user.plan_type,
        subscription_status: user.subscription_status,
        dailyUsage: user.dailyUsage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
