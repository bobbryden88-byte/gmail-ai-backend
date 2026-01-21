# ✅ Stripe Checkout Integration - Complete Guide

## Overview

This document provides a complete guide to the Stripe checkout integration for Inkwell Gmail AI Assistant. The integration handles 30-day free trials, subscription management, and seamless payment processing.

## Architecture

### Flow Diagram

```
User clicks "Upgrade to Pro"
    ↓
Extension popup (auth.js)
    ↓
Background script (background.js) - CREATE_CHECKOUT_SESSION message
    ↓
Backend API: POST /api/stripe/create-checkout-session
    ↓
StripeService.createCheckoutSession()
    ↓
Stripe API: Create checkout session with 30-day trial
    ↓
Return checkout URL to extension
    ↓
Extension opens Stripe checkout in new tab
    ↓
User completes payment
    ↓
Stripe redirects to: /payment-success.html
    ↓
Stripe webhook: checkout.session.completed
    ↓
Backend updates user subscription status
    ↓
Extension refreshes trial status automatically
```

## Backend Implementation

### 1. Checkout Session Endpoint

**Route:** `POST /api/stripe/create-checkout-session`

**Authentication:** Required (JWT token in Authorization header)

**Request Body:**
```json
{
  "plan": "monthly",  // or "yearly"
  "planType": "monthly"  // alias for compatibility
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/...",
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_...",
  "planType": "monthly",
  "trialDays": 30,
  "hasUsedTrial": false
}
```

**Key Features:**
- Automatically includes 30-day trial for new users
- Checks if user has already used trial
- Supports both monthly ($14.99 CAD) and yearly ($119.99 CAD) plans
- Returns proper error messages for edge cases

### 2. Trial Status Endpoint

**Route:** `GET /api/trial/status`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "user_id": "...",
  "email": "user@example.com",
  "is_trialing": true,
  "trial_active": true,
  "trial_start_date": "2026-01-15T...",
  "trial_end_date": "2026-02-14T...",
  "days_remaining": 25,
  "subscription_status": "trialing",
  "is_premium": true,
  "is_freemium": false,
  "is_active": false,
  "has_full_access": true,
  "daily_limit": 100,
  "summaries_used_today": 5,
  "summaries_remaining": 95,
  "usage_message": "Unlimited access"
}
```

### 3. Webhook Handler

**Route:** `POST /api/stripe/webhook`

**Authentication:** None (validated via Stripe signature)

**Handled Events:**
- `checkout.session.completed` - User completes checkout
- `customer.subscription.created` - Subscription created (with trial)
- `customer.subscription.updated` - Subscription status changes
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment processed successfully
- `invoice.payment_failed` - Payment failed

**Key Actions:**
- Updates `trialStartDate` and `trialEndDate` from Stripe subscription
- Sets `trialActive: true` when subscription is in trial period
- Updates `subscriptionStatus` based on Stripe subscription status
- Sets `isPremium: true` for active/trialing subscriptions

## Extension Implementation

### 1. Background Script (`background.js`)

**Message Handler: `CREATE_CHECKOUT_SESSION`**

```javascript
chrome.runtime.sendMessage({
  type: 'CREATE_CHECKOUT_SESSION',
  plan: 'monthly',  // or 'yearly'
  planType: 'monthly'
}, (response) => {
  if (response?.url) {
    chrome.tabs.create({ url: response.url });
  }
});
```

**Message Handler: `CHECKOUT_SUCCESS`**

Listens for success notifications from the payment success page and automatically refreshes trial status.

### 2. Popup Script (`popup/auth.js`)

**Upgrade Button Handler:**

```javascript
upgradeProBtn.addEventListener('click', async () => {
  await handleUpgrade('pro');
});
```

**Features:**
- Shows loading state during checkout creation
- Opens Stripe checkout in new tab
- Closes popup after checkout opens
- Handles errors gracefully
- Listens for trial status updates

### 3. Success Page (`public/payment-success.html`)

**Features:**
- Displays success message
- Notifies background script of successful checkout
- Provides instructions to return to Gmail
- Auto-closes after 3 seconds (if possible)

## Database Schema

### User Model Fields

```prisma
model User {
  // Subscription fields
  stripeCustomerId        String?   @unique
  stripeSubscriptionId    String?   @unique
  subscriptionStatus      String    @default("none")  // none, trialing, freemium, active, canceled
  planType                String?   // "monthly" or "yearly"
  isPremium               Boolean   @default(false)
  
  // Trial fields
  trialStartDate          DateTime?
  trialEndDate            DateTime?
  trialActive             Boolean   @default(false)
}
```

## Environment Variables

Required in `.env`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from Stripe Dashboard)
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...

# Frontend URL (for redirects)
FRONTEND_URL=https://gmail-ai-backend.vercel.app
```

## Pricing Configuration

### Current Pricing (CAD)

- **Monthly:** $14.99 CAD/month
- **Yearly:** $119.99 CAD/year (save ~33%)
- **Trial:** 30 days free for both plans

### Setting Up Prices in Stripe

1. Go to Stripe Dashboard → Products
2. Create/select your product
3. Add prices:
   - Monthly: $14.99 CAD, recurring monthly
   - Yearly: $119.99 CAD, recurring yearly
4. Copy Price IDs to environment variables

## Webhook Setup

### Stripe Dashboard Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://gmail-ai-backend.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Testing Webhooks Locally

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Error Handling

### Common Errors

1. **"User already has an active premium subscription"**
   - User tries to upgrade when already subscribed
   - Solution: Check subscription status before showing upgrade button

2. **"Price ID not found"**
   - Environment variables not set correctly
   - Solution: Verify `STRIPE_PREMIUM_MONTHLY_PRICE_ID` and `STRIPE_PREMIUM_YEARLY_PRICE_ID`

3. **"No userId in session metadata"**
   - Webhook received without user context
   - Solution: Webhook handler tries to find user by customer ID or email

4. **"Failed to create checkout session"**
   - Network error or Stripe API issue
   - Solution: Check Stripe dashboard for API errors, verify API keys

## Testing Checklist

### Backend Testing

- [ ] Create checkout session for new user (should include 30-day trial)
- [ ] Create checkout session for user who already used trial (no trial)
- [ ] Verify webhook updates database correctly
- [ ] Test trial status endpoint returns correct data
- [ ] Verify subscription cancellation updates status

### Extension Testing

- [ ] Click "Upgrade to Pro" button
- [ ] Verify checkout opens in new tab
- [ ] Complete checkout with test card: `4242 4242 4242 4242`
- [ ] Verify success page displays
- [ ] Verify extension UI updates after returning
- [ ] Test error handling (network errors, cancelled checkout)

### Webhook Testing

- [ ] Test `checkout.session.completed` event
- [ ] Test `customer.subscription.created` with trial
- [ ] Test `customer.subscription.updated` (trial → active)
- [ ] Test `invoice.payment_succeeded`
- [ ] Test `customer.subscription.deleted` (cancellation)

## Security Considerations

1. **Webhook Signature Verification**
   - All webhooks are verified using Stripe signature
   - Invalid signatures are rejected

2. **Authentication**
   - Checkout endpoint requires JWT authentication
   - User can only create checkout for themselves

3. **Rate Limiting**
   - Checkout endpoint has rate limiting (10 requests per 15 minutes)

4. **Error Messages**
   - Don't expose sensitive information in error messages
   - Log detailed errors server-side only

## Monitoring & Debugging

### Key Logs to Monitor

1. **Checkout Creation:**
   ```
   Creating checkout for user {userId}, plan: {planType}, hasUsedTrial: {bool}
   ✅ Checkout session created: {sessionId}
   ```

2. **Webhook Events:**
   ```
   📩 Processing webhook event: {eventType}
   ✅ Subscription created for user {userId}, status: {status}
   ```

3. **Trial Status:**
   ```
   Trial ends in {days} days: {trialEndDate}
   ```

### Debugging Tools

1. **Stripe Dashboard:**
   - View all checkout sessions
   - Monitor webhook deliveries
   - Check subscription status

2. **Backend Logs (Vercel):**
   - Check function logs for errors
   - Monitor webhook processing

3. **Extension Console:**
   - Background script console: `chrome://extensions` → Inspect service worker
   - Popup console: Right-click extension icon → Inspect popup

## Next Steps

### Potential Enhancements

1. **Annual Plan Support**
   - Add yearly plan selection in popup
   - Update pricing display

2. **Subscription Management**
   - Add "Manage Subscription" button
   - Integrate Stripe Customer Portal

3. **Trial Reminders**
   - Email reminders 3 days before trial ends
   - In-app notifications

4. **Usage Analytics**
   - Track conversion rates
   - Monitor trial-to-paid conversion

## Support

For issues or questions:
1. Check Stripe Dashboard for payment/subscription issues
2. Review backend logs in Vercel dashboard
3. Check extension console for client-side errors
4. Verify environment variables are set correctly

---

**Last Updated:** January 2026
**Version:** 1.0.0
