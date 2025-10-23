# 💳 Stripe Setup Guide for Gmail AI Assistant

## 🎯 Complete Stripe Integration

### **Step 1: Create Stripe Account & Products**

1. **Sign up at [stripe.com](https://stripe.com)**
2. **Complete business verification**
3. **Create your subscription products**

#### **Product Setup in Stripe Dashboard:**

**Premium Plan:**
- **Name**: "Gmail AI Assistant Premium"
- **Description**: "Unlimited AI email assistance with advanced features"
- **Pricing**: 
  - Monthly: $9.99/month
  - Yearly: $99.99/year (save 17%)

**Features:**
- ✅ 100 daily AI requests (vs 10 free)
- ✅ 3000 monthly requests (vs 300 free)
- ✅ Priority support
- ✅ Advanced AI models
- ✅ Export functionality

### **Step 2: Get API Keys**

In Stripe Dashboard → Developers → API Keys:

```
Test Mode (Development):
- Publishable key: pk_test_...
- Secret key: sk_test_...
- Webhook secret: whsec_...

Live Mode (Production):
- Publishable key: pk_live_...
- Secret key: sk_live_...
- Webhook secret: whsec_...
```

### **Step 3: Update Environment Variables**

Create/update your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_test_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_test_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Stripe Product IDs (get from Stripe Dashboard)
STRIPE_PREMIUM_MONTHLY_PRICE_ID="price_1234567890"
STRIPE_PREMIUM_YEARLY_PRICE_ID="price_0987654321"

# Frontend URLs
FRONTEND_URL="http://localhost:3000"
UPGRADE_URL="https://your-stripe-checkout-url.com"
SUCCESS_URL="http://localhost:3000/success"
CANCEL_URL="http://localhost:3000/cancel"
```

### **Step 4: Install Stripe SDK**

```bash
cd /Users/bobbryden/gmail-ai-backend
npm install stripe
```

### **Step 5: Create Stripe Service**

Create `src/services/stripe.js`:

```javascript
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create checkout session for subscription
  static async createCheckoutSession(userId, priceId, successUrl, cancelUrl) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: undefined, // Will be set by frontend
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
        },
      });

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
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          customerId: subscription.customer,
          priceId: subscription.items.data[0].price.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        }
      };
    } catch (error) {
      console.error('Stripe subscription error:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return { success: true, subscription };
    } catch (error) {
      console.error('Stripe cancel error:', error);
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

      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleSubscriptionCreated(event.data.object);
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object);
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object);
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  static async handleSubscriptionCreated(session) {
    // Update user to premium in database
    const userId = session.metadata.userId;
    // Implementation depends on your database setup
    console.log(`User ${userId} subscribed to premium`);
  }

  static async handleSubscriptionUpdated(subscription) {
    // Handle subscription changes
    console.log(`Subscription ${subscription.id} updated`);
  }

  static async handleSubscriptionDeleted(subscription) {
    // Handle subscription cancellation
    console.log(`Subscription ${subscription.id} cancelled`);
  }
}

module.exports = StripeService;
```

### **Step 6: Create Stripe Routes**

Create `src/routes/stripe.js`:

```javascript
const express = require('express');
const StripeService = require('../services/stripe');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user.id;

    const result = await StripeService.createCheckoutSession(
      userId,
      priceId,
      process.env.SUCCESS_URL,
      process.env.CANCEL_URL
    );

    if (result.success) {
      res.json({ success: true, sessionId: result.sessionId, url: result.url });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle successful payment
router.post('/success', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = await StripeService.getSubscription(sessionId);

    if (result.success) {
      // Update user in database to premium
      // Implementation depends on your database setup
      res.json({ success: true, subscription: result.subscription });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const result = await StripeService.cancelSubscription(subscriptionId);

    if (result.success) {
      res.json({ success: true, message: 'Subscription cancelled' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    await StripeService.handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

module.exports = router;
```

### **Step 7: Update Main App**

Add Stripe routes to `src/app.js`:

```javascript
const stripeRoutes = require('./routes/stripe');
app.use('/api/stripe', stripeRoutes);
```

### **Step 8: Test Stripe Integration**

1. **Test with Stripe test cards:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

2. **Test webhook locally:**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### **Step 9: Frontend Integration**

Add Stripe to your Chrome extension popup:

```javascript
// In popup/auth.js
async function upgradeToPremium() {
  try {
    const response = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        priceId: 'price_your_monthly_price_id'
      })
    });

    const data = await response.json();
    if (data.success) {
      // Open Stripe checkout in new tab
      chrome.tabs.create({ url: data.url });
    }
  } catch (error) {
    console.error('Upgrade error:', error);
  }
}
```

### **Step 10: Production Setup**

1. **Switch to live keys** in production
2. **Set up webhook endpoint** in Stripe Dashboard
3. **Configure success/cancel URLs** for your domain
4. **Test with real payments** (small amounts first)

## 🎯 **Quick Start Checklist:**

- [ ] Create Stripe account
- [ ] Get API keys
- [ ] Update .env file
- [ ] Install Stripe SDK
- [ ] Create Stripe service
- [ ] Add Stripe routes
- [ ] Test with test cards
- [ ] Deploy to production

## 💡 **Pro Tips:**

1. **Start with test mode** - never use live keys in development
2. **Handle webhooks properly** - they're crucial for subscription management
3. **Test edge cases** - failed payments, cancellations, refunds
4. **Monitor Stripe Dashboard** - watch for failed payments and disputes
5. **Set up proper error handling** - Stripe can be finicky with network issues

Ready to start monetizing your Gmail AI Assistant! 🚀
