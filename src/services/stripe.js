const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

class StripeService {
  // Create checkout session for new user signup with 30-day trial
  // This is used during registration - user MUST add card to start trial
  static async createTrialCheckoutSession(userId, userEmail, successUrl, cancelUrl) {
    try {
      const priceId = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;
      
      if (!priceId) {
        throw new Error('STRIPE_PREMIUM_MONTHLY_PRICE_ID not configured');
      }

      console.log(`Creating trial checkout for new user ${userId}, email: ${userEmail}`);

      const session = await stripe.checkout.sessions.create({
        customer_email: userEmail,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
          planType: 'monthly',
          source: 'signup_trial',
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        subscription_data: {
          trial_period_days: 30,
          metadata: {
            userId: userId,
            planType: 'monthly',
            source: 'signup_trial',
          },
        },
      });

      console.log(`✅ Trial checkout session created: ${session.id} (30-day trial)`);
      return { 
        success: true, 
        sessionId: session.id, 
        url: session.url,
        trialDays: 30
      };
    } catch (error) {
      console.error('Stripe trial checkout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get or create Stripe customer
  static async getOrCreateCustomer(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, stripeCustomerId: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return existing customer if available
    if (user.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (!customer.deleted) {
          return { customerId: user.stripeCustomerId, isNew: false };
        }
      } catch (error) {
        console.log('Existing customer not found in Stripe, creating new one');
      }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: userId }
    });

    // Save customer ID to database
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    });

    console.log(`✅ Created Stripe customer ${customer.id} for user ${userId}`);
    return { customerId: customer.id, isNew: true };
  }

  // Create checkout session for subscription
  // Always includes 30-day trial for new subscriptions (both monthly and yearly)
  static async createCheckoutSession(userId, planType = 'monthly', successUrl, cancelUrl, includeTrial = true) {
    try {
      // Get or create customer
      const { customerId } = await this.getOrCreateCustomer(userId);

      // Get user to check if they've already used their trial
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          email: true, 
          name: true, 
          trialActive: true,
          trialStartDate: true,
          trialEndDate: true,
          subscriptionStatus: true,
          stripeSubscriptionId: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has already had a trial or active subscription
      const hasUsedTrial = user.trialStartDate !== null || 
                          user.trialActive === true ||
                          ['trialing', 'active'].includes(user.subscriptionStatus) ||
                          user.stripeSubscriptionId !== null;

      // Use your specific Price IDs (CAD pricing)
      const priceId = planType === 'yearly' 
        ? process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
        : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;

      if (!priceId) {
        throw new Error(`Price ID not found for plan type: ${planType}. Please set STRIPE_PREMIUM_MONTHLY_PRICE_ID and STRIPE_PREMIUM_YEARLY_PRICE_ID in environment variables.`);
      }

      // Always include 30-day trial for new subscriptions (unless user already had one)
      const trialDays = (includeTrial && !hasUsedTrial) ? 30 : 0;

      console.log(`Creating checkout for user ${userId}, plan: ${planType}, hasUsedTrial: ${hasUsedTrial}, trialDays: ${trialDays}`);

      const sessionConfig = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
          planType: planType,
          hasUsedTrial: hasUsedTrial.toString(),
          source: 'extension_upgrade',
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        subscription_data: {
          metadata: {
            userId: userId,
            planType: planType,
            hasUsedTrial: hasUsedTrial.toString(),
            source: 'extension_upgrade',
          },
        },
      };

      // Add trial period if applicable
      if (trialDays > 0) {
        sessionConfig.subscription_data.trial_period_days = trialDays;
        console.log(`   Including ${trialDays}-day free trial`);
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      console.log(`✅ Checkout session created: ${session.id} (${trialDays > 0 ? `${trialDays}-day trial` : 'no trial'})`);
      return { 
        success: true, 
        sessionId: session.id, 
        url: session.url,
        checkoutUrl: session.url, // Alias for compatibility
        hasUsedTrial: hasUsedTrial,
        trialDays: trialDays,
        planType: planType
      };
    } catch (error) {
      console.error('Stripe checkout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Retrieve subscription details
  static async getSubscription(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session.subscription) {
        throw new Error('No subscription found for this session');
      }

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          customerId: subscription.customer,
          priceId: subscription.items.data[0].price.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
        }
      };
    } catch (error) {
      console.error('Stripe subscription error:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel subscription (at period end)
  static async cancelSubscription(subscriptionId) {
    try {
      console.log('Cancelling subscription:', subscriptionId);
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      console.log('Subscription updated:', {
        id: subscription.id,
        cancel_at_period_end: subscription.cancel_at_period_end,
        cancel_at: subscription.cancel_at,
        current_period_end: subscription.current_period_end
      });

      return { success: true, subscription };
    } catch (error) {
      console.error('Stripe cancel error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reactivate subscription (remove cancel_at_period_end)
  static async reactivateSubscription(subscriptionId) {
    try {
      console.log('Reactivating subscription:', subscriptionId);
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      console.log('Subscription reactivated:', {
        id: subscription.id,
        cancel_at_period_end: subscription.cancel_at_period_end,
        status: subscription.status
      });

      return { success: true, subscription };
    } catch (error) {
      console.error('Stripe reactivate error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get subscription details
  static async getSubscriptionDetails(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: subscription.cancel_at,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          planInterval: subscription.items.data[0].price.recurring.interval,
          planAmount: subscription.items.data[0].price.unit_amount
        }
      };
    } catch (error) {
      console.error('Get subscription details error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get customer subscriptions
  static async getCustomerSubscriptions(customerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
      });

      return { success: true, subscriptions: subscriptions.data };
    } catch (error) {
      console.error('Get subscriptions error:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle webhook events
  static async handleWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`📩 Processing webhook event: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutCompleted(event.data.object);
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event.data.object);
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object);
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object);
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSucceeded(event.data.object);
        case 'invoice.payment_failed':
          return await this.handlePaymentFailed(event.data.object);
        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { success: true, message: 'Event not handled' };
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  static async handleCheckoutCompleted(session) {
    try {
      console.log('🔔 WEBHOOK: checkout.session.completed');
      console.log('Session ID:', session.id);
      console.log('Customer:', session.customer);
      console.log('Customer Email:', session.customer_email);
      console.log('Metadata:', JSON.stringify(session.metadata, null, 2));
      console.log('Subscription ID:', session.subscription);
      
      // Extract userId from metadata (primary source)
      let userId = session.metadata?.userId;
      const planType = session.metadata?.planType || 'monthly';
      
      // If userId is missing, try to find user by customer ID or email
      if (!userId) {
        console.warn('⚠️ No userId in session metadata, attempting to find user by customer/email...');
        
        // Try to find by Stripe customer ID first
        if (session.customer) {
          const userByCustomer = await prisma.user.findFirst({
            where: { stripeCustomerId: session.customer }
          });
          if (userByCustomer) {
            userId = userByCustomer.id;
            console.log(`✅ Found user by customer ID: ${userId} (${userByCustomer.email})`);
          }
        }
        
        // If still not found, try by email
        if (!userId && session.customer_email) {
          const userByEmail = await prisma.user.findFirst({
            where: { email: session.customer_email.toLowerCase() }
          });
          if (userByEmail) {
            userId = userByEmail.id;
            console.log(`✅ Found user by email: ${userId} (${userByEmail.email})`);
          }
        }
        
        if (!userId) {
          console.error('❌ Could not find user for checkout session:', {
            sessionId: session.id,
            customer: session.customer,
            customerEmail: session.customer_email,
            metadata: session.metadata
          });
          throw new Error('No userId found in session metadata and could not locate user by customer ID or email');
        }
      } else {
        console.log(`✅ Using userId from metadata: ${userId}`);
      }
      
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, subscriptionStatus: true }
      });
      
      if (!user) {
        throw new Error(`User not found with ID: ${userId}`);
      }
      
      console.log(`Processing checkout for user: ${user.email} (${user.id}), current status: ${user.subscriptionStatus}`);
      
      // Check if session has a subscription
      if (!session.subscription) {
        console.log('⚠️ No subscription in session (might be one-time payment or incomplete checkout)');
        return { success: true, message: 'No subscription to process' };
      }
      
      // Retrieve full subscription details from Stripe
      console.log('Retrieving subscription from Stripe:', session.subscription);
      let subscription;
      try {
        subscription = await stripe.subscriptions.retrieve(session.subscription);
      } catch (stripeError) {
        console.error('❌ Failed to retrieve subscription from Stripe:', stripeError);
        throw new Error(`Failed to retrieve subscription: ${stripeError.message}`);
      }
      
      console.log('Subscription details:', {
        id: subscription.id,
        customer: subscription.customer,
        status: subscription.status,
        trial_start: subscription.trial_start,
        trial_end: subscription.trial_end,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end
      });
      
      // Update user subscription in database
      console.log(`Updating user ${userId} subscription in database...`);
      const updatedUser = await this.updateUserSubscription(userId, subscription, planType);
      
      console.log(`✅ User ${userId} (${user.email}) subscription successfully updated!`);
      console.log('Updated subscription status:', updatedUser.subscriptionStatus);
      console.log('Updated isPremium:', updatedUser.isPremium);
      console.log('Updated stripeSubscriptionId:', updatedUser.stripeSubscriptionId);
      
      return { success: true, message: 'Checkout completed and user subscription updated' };
    } catch (error) {
      console.error('❌ Error handling checkout completion:', error);
      console.error('Error stack:', error.stack);
      console.error('Session data:', JSON.stringify(session, null, 2));
      throw error;
    }
  }

  // Helper method to update user subscription data
  static async updateUserSubscription(userId, subscription, planType) {
    try {
      console.log(`Updating subscription for user ${userId}...`);
      
      // Convert Stripe timestamps to Date objects
      const trialStartDate = subscription.trial_start 
        ? new Date(subscription.trial_start * 1000) 
        : null;
      const trialEndDate = subscription.trial_end 
        ? new Date(subscription.trial_end * 1000) 
        : null;
      
      // Determine if subscription is in trial period
      const isTrialing = subscription.status === 'trialing' || (subscription.trial_end !== null && subscription.trial_end > Math.floor(Date.now() / 1000));
      
      // Determine if user should have premium access
      const hasPremiumAccess = ['active', 'trialing'].includes(subscription.status);
      
      console.log('Subscription update data:', {
        status: subscription.status,
        isTrialing: isTrialing,
        hasPremiumAccess: hasPremiumAccess,
        trialStartDate: trialStartDate?.toISOString(),
        trialEndDate: trialEndDate?.toISOString(),
        planType: planType
      });
      
      // Update user record in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: hasPremiumAccess,
          stripeCustomerId: subscription.customer,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          trialActive: isTrialing,
          trialStartDate: trialStartDate,
          trialEndDate: trialEndDate,
          planType: planType,
        }
      });

      console.log('✅ Database update successful');
      
      if (trialEndDate) {
        const daysRemaining = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`   Trial ends in ${daysRemaining} days: ${trialEndDate.toISOString()}`);
      }

      return updatedUser;
    } catch (dbError) {
      console.error('❌ Database update failed:', dbError);
      console.error('Update data:', {
        userId: userId,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        customerId: subscription.customer
      });
      throw new Error(`Failed to update user subscription in database: ${dbError.message}`);
    }
  }

  static async handleSubscriptionCreated(subscription) {
    try {
      console.log('🔔 WEBHOOK: customer.subscription.created');
      console.log('Subscription ID:', subscription.id);
      console.log('Status:', subscription.status);
      console.log('Trial start:', subscription.trial_start);
      console.log('Trial end:', subscription.trial_end);
      console.log('Current period end:', subscription.current_period_end);
      
      const userId = subscription.metadata?.userId;
      const planType = subscription.metadata?.planType || 'monthly';
      
      // Prepare trial dates if subscription has a trial
      const trialStartDate = subscription.trial_start 
        ? new Date(subscription.trial_start * 1000) 
        : null;
      const trialEndDate = subscription.trial_end 
        ? new Date(subscription.trial_end * 1000) 
        : null;
      
      // Determine if subscription is in trial period
      const isTrialing = subscription.status === 'trialing' || subscription.trial_end !== null;
      
      const updateData = {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        subscriptionStatus: subscription.status,
        isPremium: ['active', 'trialing'].includes(subscription.status),
        trialStartDate: trialStartDate,
        trialEndDate: trialEndDate,
        trialActive: isTrialing,
        planType: planType,
      };
      
      if (!userId) {
        // Try to find user by customer ID or email
        let user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer }
        });
        
        // If not found by customer ID, try to find by email from customer object
        if (!user) {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer);
            if (customer.email) {
              user = await prisma.user.findFirst({
                where: { email: customer.email.toLowerCase() }
              });
            }
          } catch (e) {
            console.log('Could not retrieve customer:', e.message);
          }
        }
        
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: updateData
          });
          console.log(`✅ Updated subscription for user ${user.id} (found by customer/email)`);
          if (trialEndDate) {
            const daysRemaining = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
            console.log(`   Trial ends in ${daysRemaining} days: ${trialEndDate.toISOString()}`);
          }
        } else {
          console.log('⚠️ Could not find user for subscription');
        }
        return { success: true, message: 'Subscription created' };
      }
      
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      console.log(`✅ Subscription created for user ${userId}, status: ${subscription.status}`);
      if (trialEndDate) {
        const daysRemaining = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`   Trial ends in ${daysRemaining} days: ${trialEndDate.toISOString()}`);
      }
      return { success: true, message: 'Subscription created' };
    } catch (error) {
      console.error('Error handling subscription creation:', error);
      throw error;
    }
  }

  static async handleSubscriptionUpdated(subscription) {
    try {
      console.log('🔔 WEBHOOK: customer.subscription.updated');
      console.log('Subscription ID:', subscription.id);
      console.log('Status:', subscription.status);
      
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (user) {
        const isPremium = ['active', 'trialing'].includes(subscription.status);
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPremium: isPremium,
            subscriptionStatus: subscription.status,
          }
        });

        console.log(`✅ Updated subscription status for user ${user.id}: ${subscription.status}`);
      } else {
        // Try to find by customer ID
        const userByCustomer = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer }
        });
        
        if (userByCustomer) {
          const isPremium = ['active', 'trialing'].includes(subscription.status);
          
          await prisma.user.update({
            where: { id: userByCustomer.id },
            data: {
              stripeSubscriptionId: subscription.id,
              isPremium: isPremium,
              subscriptionStatus: subscription.status,
            }
          });
          console.log(`✅ Updated subscription for user ${userByCustomer.id} (found by customer ID)`);
        }
      }

      return { success: true, message: 'Subscription updated' };
    } catch (error) {
      console.error('Error handling subscription update:', error);
      throw error;
    }
  }

  static async handleSubscriptionDeleted(subscription) {
    try {
      console.log('🔔 WEBHOOK: customer.subscription.deleted');
      console.log('Subscription ID:', subscription.id);
      
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPremium: false,
            stripeSubscriptionId: null,
            subscriptionStatus: 'canceled',
          }
        });

        console.log(`✅ User ${user.id} subscription cancelled`);
      }

      return { success: true, message: 'Subscription cancelled' };
    } catch (error) {
      console.error('Error handling subscription deletion:', error);
      throw error;
    }
  }

  static async handlePaymentSucceeded(invoice) {
    try {
      console.log('🔔 WEBHOOK: invoice.payment_succeeded');
      console.log('Subscription:', invoice.subscription);
      
      if (invoice.subscription) {
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: invoice.subscription }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPremium: true,
              subscriptionStatus: 'active',
            }
          });
          console.log(`✅ Payment succeeded, user ${user.id} status: active`);
        }
      }
      
      return { success: true, message: 'Payment succeeded' };
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  static async handlePaymentFailed(invoice) {
    try {
      console.log('🔔 WEBHOOK: invoice.payment_failed');
      console.log('Subscription:', invoice.subscription);
      
      if (invoice.subscription) {
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: invoice.subscription }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'past_due',
            }
          });
          console.log(`⚠️ Payment failed, user ${user.id} status: past_due`);
        }
      }
      
      return { success: true, message: 'Payment failed recorded' };
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }

  // Get pricing information for frontend
  static async getPricingInfo() {
    try {
      const prices = await stripe.prices.list({
        active: true,
        type: 'recurring',
      });

      const pricingInfo = prices.data.map(price => ({
        id: price.id,
        amount: price.unit_amount / 100,
        currency: price.currency,
        interval: price.recurring.interval,
        intervalCount: price.recurring.interval_count,
        productId: price.product,
      }));

      return { success: true, pricing: pricingInfo };
    } catch (error) {
      console.error('Error getting pricing info:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = StripeService;
