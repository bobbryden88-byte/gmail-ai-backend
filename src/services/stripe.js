const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

class StripeService {
  // Create checkout session for subscription
  static async createCheckoutSession(userId, planType = 'monthly', successUrl, cancelUrl) {
    try {
      // Get user email for Stripe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Use your specific Price IDs
      const priceId = planType === 'yearly' 
        ? process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID  // "price_1SGQgoBj2yIrR2RDPLSBssOB"
        : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID; // "price_1SGQgoBj2yIrR2RDihOHgo3b"

      if (!priceId) {
        throw new Error(`Price ID not found for plan type: ${planType}`);
      }

      console.log(`Creating checkout session for user ${userId}, plan: ${planType}, priceId: ${priceId}`);

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
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
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        subscription_data: {
          metadata: {
            userId: userId,
            planType: planType,
          },
        },
      });

      console.log(`✅ Checkout session created: ${session.id}`);
      return { success: true, sessionId: session.id, url: session.url };
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

      console.log(`Processing webhook event: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
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

  static async handleSubscriptionCreated(session) {
    try {
      console.log('🔔 WEBHOOK: checkout.session.completed');
      console.log('Session ID:', session.id);
      console.log('Metadata:', session.metadata);
      
      const userId = session.metadata.userId;
      
      if (!userId) {
        console.error('❌ No userId in session metadata!');
        throw new Error('No userId found in session metadata');
      }
      
      if (!session.subscription) {
        console.error('❌ No subscription in session!');
        throw new Error('No subscription found in session');
      }
      
      console.log('Retrieving subscription:', session.subscription);
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      console.log('Subscription details:', {
        id: subscription.id,
        customer: subscription.customer,
        status: subscription.status
      });
      
      // Update user to premium in database
      console.log('Updating user in database:', userId);
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          stripeCustomerId: subscription.customer,
          subscriptionId: subscription.id,
        }
      });

      console.log(`✅ User ${userId} upgraded to premium successfully!`);
      console.log('Updated user:', {
        id: updatedUser.id,
        email: updatedUser.email,
        isPremium: updatedUser.isPremium,
        subscriptionId: updatedUser.subscriptionId
      });
      
      return { success: true, message: 'User upgraded to premium' };
    } catch (error) {
      console.error('❌ Error handling subscription creation:', error);
      throw error;
    }
  }

  static async handleSubscriptionUpdated(subscription) {
    try {
      const user = await prisma.user.findFirst({
        where: { subscriptionId: subscription.id }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPremium: subscription.status === 'active',
          }
        });

        console.log(`✅ Updated subscription status for user ${user.id}: ${subscription.status}`);
      }

      return { success: true, message: 'Subscription updated' };
    } catch (error) {
      console.error('Error handling subscription update:', error);
      throw error;
    }
  }

  static async handleSubscriptionDeleted(subscription) {
    try {
      const user = await prisma.user.findFirst({
        where: { subscriptionId: subscription.id }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPremium: false,
            subscriptionId: null,
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
    console.log(`✅ Payment succeeded for subscription: ${invoice.subscription}`);
    return { success: true, message: 'Payment succeeded' };
  }

  static async handlePaymentFailed(invoice) {
    console.log(`❌ Payment failed for subscription: ${invoice.subscription}`);
    return { success: true, message: 'Payment failed' };
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
        amount: price.unit_amount / 100, // Convert from cents
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