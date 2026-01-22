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

// Cancel subscription (sets to cancel at period end)
router.post('/cancel-subscription', authenticateToken, stripeLimiter, async (req, res) => {
  try {
    console.log('🚫 Cancel subscription request from user:', req.user.id);
    const userId = req.user.id;

    // Get user's subscription ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        stripeSubscriptionId: true, 
        isPremium: true,
        email: true,
        stripeCustomerId: true
      }
    });

    console.log('User subscription info:', {
      email: user.email,
      subscriptionId: user.stripeSubscriptionId,
      isPremium: user.isPremium,
      stripeCustomerId: user.stripeCustomerId
    });

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
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
        
        // Use the real subscription ID for cancellation
        const result = await StripeService.cancelSubscription(subscription.id);
        
        if (result.success) {
          console.log('✅ Subscription cancelled (at period end):', result.subscription);
          res.json({ 
            success: true, 
            message: 'Subscription will be cancelled at the end of the billing period',
            subscription: result.subscription,
            cancelAt: result.subscription.cancel_at,
            currentPeriodEnd: result.subscription.current_period_end
          });
        } else {
          console.error('❌ Failed to cancel subscription:', result.error);
          res.status(400).json({ error: result.error });
        }
        return;
      }
    }

    // Cancel at period end (user keeps access until billing period ends)
    const result = await StripeService.cancelSubscription(user.stripeSubscriptionId);

    if (result.success) {
      console.log('✅ Subscription cancelled (at period end):', result.subscription);
      
      // Note: We DON'T set isPremium to false immediately
      // User keeps premium access until period ends
      // Webhook will handle the final status update

      res.json({ 
        success: true, 
        message: 'Subscription will be cancelled at the end of the billing period',
        subscription: result.subscription,
        cancelAt: result.subscription.cancel_at,
        currentPeriodEnd: result.subscription.current_period_end
      });
    } else {
      console.error('❌ Failed to cancel subscription:', result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
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

// Stripe webhook handler (no authentication required)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      console.error('❌ Webhook request missing Stripe signature');
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    console.log('📩 Webhook received, processing...');
    const result = await StripeService.handleWebhook(req.body, signature);
    
    console.log('✅ Webhook processed successfully:', result);
    res.json({ received: true, success: true, message: result?.message || 'Webhook processed' });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return 200 to Stripe to prevent retries for non-recoverable errors
    // But log the error for debugging
    res.status(200).json({ 
      received: true, 
      error: error.message,
      note: 'Error logged but webhook acknowledged to prevent retries'
    });
  }
});

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
