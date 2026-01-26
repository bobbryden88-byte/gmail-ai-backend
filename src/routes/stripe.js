const express = require('express');
const StripeService = require('../services/stripe');
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for Stripe endpoints
const stripeLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many Stripe requests, please try again later.'
});

// Get pricing information (public endpoint)
router.get('/pricing', async (req, res) => {
  try {
    const result = await StripeService.getPricingInfo();
    
    if (result.success) {
      res.json({ success: true, pricing: result.pricing });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Pricing info error:', error);
    res.status(500).json({ error: 'Failed to get pricing information' });
  }
});

// Get trial status for current user
router.get('/trial-status', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        isPremium: true,
        subscriptionStatus: true,
        trialStartDate: true,
        trialEndDate: true,
        planType: true,
        stripeSubscriptionId: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate trial days remaining
    const isTrialing = user.subscriptionStatus === 'trialing';
    let trialDaysRemaining = 0;
    
    if (isTrialing && user.trialEndDate) {
      const now = new Date();
      const trialEnd = new Date(user.trialEndDate);
      trialDaysRemaining = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
    }

    // Check if user has ever had a trial (to prevent re-trials)
    const hasUsedTrial = user.trialStartDate !== null || user.subscriptionStatus !== null;

    res.json({
      success: true,
      trial: {
        isTrialing: isTrialing,
        trialDaysRemaining: trialDaysRemaining,
        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,
        hasUsedTrial: hasUsedTrial,
      },
      subscription: {
        status: user.subscriptionStatus,
        planType: user.planType,
        isPremium: user.isPremium,
        hasSubscription: !!user.stripeSubscriptionId,
      }
    });
  } catch (error) {
    console.error('Trial status error:', error);
    res.status(500).json({ error: 'Failed to get trial status' });
  }
});

// Create checkout session (requires authentication)
// Accepts: { plan: 'monthly' | 'yearly' } or { planType: 'monthly' | 'yearly' }
// Returns: { success: true, url: checkoutUrl, sessionId, trialDays, planType }
router.post('/create-checkout-session', authenticateToken, stripeLimiter, async (req, res) => {
  try {
    // Support both 'plan' and 'planType' for compatibility
    const planType = req.body.plan || req.body.planType || 'monthly';
    const userId = req.user.id;

    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({ 
        error: 'Plan type must be "monthly" or "yearly"',
        received: planType
      });
    }

    // Check if user already has an active subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        isPremium: true, 
        stripeSubscriptionId: true, 
        subscriptionStatus: true 
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Allow upgrade if subscription is canceled or they're on freemium
    if (user.isPremium && 
        user.subscriptionStatus !== 'canceled' && 
        user.subscriptionStatus !== 'freemium' &&
        user.stripeSubscriptionId) {
      return res.status(400).json({ 
        error: 'User already has an active premium subscription',
        alreadyPremium: true,
        subscriptionStatus: user.subscriptionStatus
      });
    }

    // Use environment variable for base URL, fallback to production
    const baseUrl = process.env.FRONTEND_URL || 'https://gmail-ai-backend.vercel.app';
    const successUrl = `${baseUrl}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment-cancelled.html`;

    console.log(`📝 Creating checkout session for user ${userId}, plan: ${planType}`);

    const result = await StripeService.createCheckoutSession(
      userId,
      planType,
      successUrl,
      cancelUrl,
      true // Always include trial if user hasn't used it
    );

    if (result.success) {
      console.log(`✅ Checkout session created: ${result.sessionId}`);
      res.json({ 
        success: true, 
        sessionId: result.sessionId, 
        checkoutUrl: result.url,
        url: result.url, // Primary field for extension compatibility
        planType: result.planType || planType,
        trialDays: result.trialDays || 0,
        hasUsedTrial: result.hasUsedTrial || false
      });
    } else {
      console.error('❌ Checkout session creation failed:', result.error);
      res.status(400).json({ 
        error: result.error || 'Failed to create checkout session',
        details: result.error
      });
    }
  } catch (error) {
    console.error('❌ Checkout session error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Handle successful payment (called after Stripe redirects back)
router.post('/success', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    console.log('🎯 Payment success endpoint called');
    console.log('User ID:', req.user.id);
    console.log('Session ID:', sessionId);
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const result = await StripeService.getSubscription(sessionId);

    if (result.success) {
      // Update user in database to premium
      console.log('Upgrading user to premium...');
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          isPremium: true,
          stripeCustomerId: result.subscription.customerId,
          stripeSubscriptionId: result.subscription.id,
        }
      });

      console.log(`✅ User ${req.user.id} successfully upgraded to premium via success endpoint`);
      console.log('Updated user details:', {
        id: updatedUser.id,
        email: updatedUser.email,
        isPremium: updatedUser.isPremium,
        subscriptionId: updatedUser.stripeSubscriptionId
      });

      res.json({ 
        success: true, 
        subscription: result.subscription,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          isPremium: updatedUser.isPremium,
          subscriptionId: updatedUser.stripeSubscriptionId,
        }
      });
    } else {
      console.error('❌ Failed to get subscription:', result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ Payment success error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Cancel subscription immediately (removes access right away)
router.post('/cancel-subscription', authenticateToken, stripeLimiter, async (req, res) => {
  try {
    console.log('🔄 [CANCEL] User requesting subscription cancellation');
    const userId = req.user.id;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true,
        stripeSubscriptionId: true, 
        isPremium: true,
        subscriptionStatus: true,
        stripeCustomerId: true
      }
    });

    if (!user) {
      console.error('❌ [CANCEL] User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('🔄 [CANCEL] User subscription info:', {
      userId: user.id,
      email: user.email,
      subscriptionId: user.stripeSubscriptionId,
      isPremium: user.isPremium,
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId
    });

    // Check if user has an active subscription
    if (!user.stripeSubscriptionId) {
      console.log('⚠️ [CANCEL] No subscription ID found for user');
      return res.status(400).json({ 
        success: false,
        error: 'No active subscription found',
        message: 'You do not have an active subscription to cancel'
      });
    }

    // Check if subscription is already cancelled
    if (user.subscriptionStatus === 'canceled' || user.subscriptionStatus === 'cancelled') {
      console.log('⚠️ [CANCEL] Subscription already cancelled');
      return res.status(400).json({ 
        success: false,
        error: 'Subscription already cancelled',
        message: 'Your subscription has already been cancelled'
      });
    }

    let subscriptionId = user.stripeSubscriptionId;

    // Handle manual activation IDs - try to find real Stripe subscription
    if (subscriptionId.startsWith('manual_activation_')) {
      console.log('⚠️ [CANCEL] Found manual activation ID, attempting to resolve real Stripe subscription...');
      
      if (!user.stripeCustomerId) {
        // Try to find customer by email
        const Stripe = require('stripe');
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1
        });
        
        if (customers.data.length === 0) {
          console.error('❌ [CANCEL] No Stripe customer found for manual activation');
          return res.status(400).json({ 
            success: false,
            error: 'No Stripe customer found. Please contact support.' 
          });
        }
        
        const customer = customers.data[0];
        console.log('✅ [CANCEL] Found Stripe customer:', customer.id);
        
        // Find active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active'
        });
        
        if (subscriptions.data.length === 0) {
          console.error('❌ [CANCEL] No active Stripe subscription found');
          return res.status(400).json({ 
            success: false,
            error: 'No active subscription found. Please contact support.' 
          });
        }
        
        const subscription = subscriptions.data[0];
        subscriptionId = subscription.id;
        console.log('✅ [CANCEL] Found real subscription:', subscriptionId);
        
        // Update user with correct IDs
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customer.id
          }
        });
        
        console.log('✅ [CANCEL] Updated user with correct subscription ID');
      }
    }

    // Cancel subscription immediately in Stripe
    console.log('🔄 [CANCEL] Cancelling subscription in Stripe:', subscriptionId);
    const result = await StripeService.cancelSubscriptionImmediately(subscriptionId);

    if (!result.success) {
      console.error('❌ [CANCEL] Failed to cancel subscription in Stripe:', result.error);
      return res.status(500).json({ 
        success: false,
        error: result.error || 'Failed to cancel subscription in Stripe',
        message: 'Unable to cancel subscription. Please try again or contact support.'
      });
    }

    console.log('✅ [CANCEL] Subscription cancelled in Stripe:', result.subscription.id);

    // Update database immediately
    console.log('🔄 [CANCEL] Updating database for user:', userId);
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'canceled',
          isPremium: false,
          trialActive: false,
          trialStartDate: null,
          trialEndDate: null,
          // Keep stripeSubscriptionId for reference
        }
      });

      console.log('✅ [CANCEL] Database updated for user:', userId);
      console.log('✅ [CANCEL] Updated subscription status:', updatedUser.subscriptionStatus);
      console.log('✅ [CANCEL] Updated isPremium:', updatedUser.isPremium);

      return res.status(200).json({ 
        success: true, 
        message: 'Subscription cancelled successfully',
        subscription: {
          id: result.subscription.id,
          status: result.subscription.status,
          canceled_at: result.subscription.canceled_at
        },
        user: {
          subscriptionStatus: updatedUser.subscriptionStatus,
          isPremium: updatedUser.isPremium
        }
      });
    } catch (dbError) {
      console.error('❌ [CANCEL] Database update failed:', dbError);
      // Subscription is cancelled in Stripe, but DB update failed
      // Return success but log the error
      return res.status(200).json({ 
        success: true,
        message: 'Subscription cancelled in Stripe, but database update failed. Please contact support.',
        warning: 'Database update error',
        subscription: {
          id: result.subscription.id,
          status: result.subscription.status
        }
      });
    }
  } catch (error) {
    console.error('❌ [CANCEL] Cancel subscription error:', error);
    console.error('❌ [CANCEL] Error stack:', error.stack);
    return res.status(200).json({ 
      success: false,
      error: error.message || 'Failed to cancel subscription',
      message: 'An error occurred while cancelling your subscription. Please try again or contact support.'
    });
  }
});

// Reactivate subscription (remove cancel_at_period_end)
router.post('/reactivate-subscription', authenticateToken, stripeLimiter, async (req, res) => {
  try {
    console.log('🔄 Reactivate subscription request from user:', req.user.id);
    const userId = req.user.id;

    // Get user's subscription ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        stripeSubscriptionId: true,
        email: true,
        stripeCustomerId: true
      }
    });

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    // Handle manual activation IDs - try to find real Stripe subscription
    if (user.stripeSubscriptionId.startsWith('manual_activation_')) {
      console.log('⚠️ Found manual activation ID, attempting to resolve real Stripe subscription...');
      
      if (!user.stripeCustomerId) {
        // Try to find customer by email
        const Stripe = require('stripe');
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1
        });
        
        if (customers.data.length === 0) {
          return res.status(400).json({ error: 'No Stripe customer found for manual activation. Please contact support.' });
        }
        
        const customer = customers.data[0];
        console.log('✅ Found Stripe customer:', customer.id);
        
        // Find active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active'
        });
        
        if (subscriptions.data.length === 0) {
          return res.status(400).json({ error: 'No active Stripe subscription found for manual activation. Please contact support.' });
        }
        
        const subscription = subscriptions.data[0];
        console.log('✅ Found real subscription:', subscription.id);
        
        // Update user with correct IDs
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: customer.id
          }
        });
        
        console.log('✅ Updated user with correct subscription ID');
        
        // Use the real subscription ID for reactivation
        const result = await StripeService.reactivateSubscription(subscription.id);
        
        if (result.success) {
          console.log('✅ Subscription reactivated:', result.subscription);
          res.json({ 
            success: true, 
            message: 'Subscription reactivated successfully',
            subscription: result.subscription
          });
        } else {
          console.error('❌ Failed to reactivate subscription:', result.error);
          res.status(400).json({ error: result.error });
        }
        return;
      }
    }

    const result = await StripeService.reactivateSubscription(user.stripeSubscriptionId);

    if (result.success) {
      console.log('✅ Subscription reactivated:', result.subscription);

      res.json({ 
        success: true, 
        message: 'Subscription reactivated successfully',
        subscription: result.subscription
      });
    } else {
      console.error('❌ Failed to reactivate subscription:', result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ Reactivate subscription error:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Get user's subscription status
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        dailyUsage: true,
        monthlyUsage: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let subscriptionDetails = null;
    if (user.stripeSubscriptionId) {
      // Get full subscription details including cancellation status
      const result = await StripeService.getSubscriptionDetails(user.stripeSubscriptionId);
      if (result.success) {
        subscriptionDetails = result.subscription;
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        subscriptionId: user.stripeSubscriptionId,
        dailyUsage: user.dailyUsage,
        monthlyUsage: user.monthlyUsage,
      },
      subscription: subscriptionDetails,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Stripe webhook: handled in app.js (POST /api/stripe/webhook) BEFORE express.json()
// so it receives the raw body for signature verification. Do not add it here.

// Create customer portal session (for subscription management)
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { stripeCustomerId: true, email: true }
    });

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account`,
      });

      res.json({ 
        success: true, 
        url: portalSession.url 
      });
    } catch (portalError) {
      console.error('Stripe portal error:', portalError.message);
      
      // If portal is not configured, provide helpful error message
      if (portalError.code === 'billing_portal_configuration_inactive') {
        res.status(400).json({ 
          error: 'Stripe Customer Portal is not configured. Please contact support for subscription management.',
          code: 'portal_not_configured'
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to create portal session. Please contact support.',
          details: portalError.message
        });
      }
    }
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

module.exports = router;
