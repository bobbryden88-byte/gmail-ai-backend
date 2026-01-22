# Stripe Webhook Diagnosis & Fix

## Problem Summary
- ✅ Stripe webhook `checkout.session.completed` is firing successfully
- ✅ Subscription is being created in Stripe (e.g., `sub_1SsVIbBj2yIrR2RD8Ak51Pf9`)
- ❌ Database is NOT being updated with subscription info
- ❌ Users see "Start Free Trial" even though payment succeeded

## Root Cause Analysis

### Issues Found:

1. **Insufficient Error Handling & Logging**
   - Webhook errors were being caught but not logged with enough detail
   - Silent failures made debugging impossible
   - No verification that database updates actually succeeded

2. **User ID Resolution Logic**
   - When `userId` was missing from metadata, fallback logic was incomplete
   - Didn't try to find user by Stripe customer ID first (more reliable)
   - Error messages weren't descriptive enough

3. **Database Update Verification**
   - No logging of what data was being written to database
   - No verification that the update actually succeeded
   - Trial date calculations could fail silently

4. **Webhook Response Handling**
   - Webhook route returned 400 on errors, causing Stripe to retry
   - Should return 200 to acknowledge receipt, but log errors for debugging

## Fixes Applied

### 1. Enhanced `handleCheckoutCompleted` Method
**Location:** `src/services/stripe.js:345-398`

**Improvements:**
- ✅ Added comprehensive logging at every step
- ✅ Improved user lookup: tries customer ID first, then email
- ✅ Verifies user exists before processing
- ✅ Better error messages with full context
- ✅ Logs subscription details before and after update

**Key Changes:**
```javascript
// Now tries multiple methods to find user:
1. userId from metadata (primary)
2. Find by Stripe customer ID (most reliable)
3. Find by customer email (fallback)
```

### 2. Enhanced `updateUserSubscription` Method
**Location:** `src/services/stripe.js:400-430`

**Improvements:**
- ✅ Added try-catch with detailed error logging
- ✅ Logs all data being written to database
- ✅ Verifies trial date calculations
- ✅ Better error messages if database update fails

**Key Changes:**
- More accurate trial status detection
- Logs before/after state for debugging
- Throws descriptive errors if update fails

### 3. Improved Webhook Route Handler
**Location:** `src/routes/stripe.js:499-514`

**Improvements:**
- ✅ Returns 200 even on errors (to prevent Stripe retries)
- ✅ Logs errors with full stack traces
- ✅ Better error messages

**Key Changes:**
- Always returns 200 to Stripe (prevents infinite retries)
- Logs errors for debugging
- Returns success/error status in response body

## Testing Checklist

### 1. Verify Webhook is Receiving Events
```bash
# Check Vercel logs for:
📩 Webhook received, processing...
🔔 WEBHOOK: checkout.session.completed
```

### 2. Verify User ID Resolution
Look for these log messages:
- `✅ Using userId from metadata: <userId>`
- OR `✅ Found user by customer ID: <userId>`
- OR `✅ Found user by email: <userId>`

### 3. Verify Database Update
Look for these log messages:
- `Updating subscription for user <userId>...`
- `✅ Database update successful`
- `Updated subscription status: <status>`
- `Updated isPremium: <true/false>`
- `Updated stripeSubscriptionId: <subscription_id>`

### 4. Verify Subscription Status
After webhook processes, check database:
```sql
SELECT id, email, subscriptionStatus, isPremium, stripeSubscriptionId 
FROM users 
WHERE stripeSubscriptionId = 'sub_1SsVIbBj2yIrR2RD8Ak51Pf9';
```

Expected values:
- `subscriptionStatus`: `'trialing'` or `'active'`
- `isPremium`: `true`
- `stripeSubscriptionId`: `'sub_1SsVIbBj2yIrR2RD8Ak51Pf9'`

## Common Issues & Solutions

### Issue: "No userId found in session metadata"
**Cause:** Checkout session was created without userId in metadata
**Solution:** 
1. Check `createCheckoutSession` is being called with userId
2. Verify metadata is being set correctly (see line 159-164 in stripe.js)
3. Webhook will now try to find user by customer ID or email

### Issue: "User not found with ID: <userId>"
**Cause:** userId in metadata doesn't match any user in database
**Solution:**
1. Check if user exists: `SELECT * FROM users WHERE id = '<userId>'`
2. Verify userId format matches database (should be cuid string)
3. Check if user was deleted

### Issue: "Failed to retrieve subscription from Stripe"
**Cause:** Subscription ID is invalid or doesn't exist
**Solution:**
1. Verify subscription exists in Stripe Dashboard
2. Check subscription ID format
3. Verify STRIPE_SECRET_KEY is correct

### Issue: "Database update failed"
**Cause:** Prisma/database connection issue or invalid data
**Solution:**
1. Check DATABASE_URL environment variable
2. Verify Prisma schema matches database
3. Check database connection logs
4. Verify all required fields are present

## Environment Variables Required

Make sure these are set in Vercel:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (from Stripe Dashboard)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - For authentication

## Webhook Endpoint Configuration

**Vercel URL:** `https://gmail-ai-backend.vercel.app/api/stripe/webhook`

**Stripe Dashboard Setup:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://gmail-ai-backend.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Manual Testing

### Test Webhook Locally:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test checkout
stripe trigger checkout.session.completed
```

### Test with Real Checkout:
1. Create a test checkout session via your app
2. Complete checkout in Stripe test mode
3. Check Vercel logs for webhook processing
4. Verify database was updated

## Next Steps

1. **Deploy the fixes** to Vercel
2. **Monitor webhook logs** in Vercel dashboard
3. **Test with a real checkout** session
4. **Verify database updates** are happening
5. **Check frontend** is reading correct subscription status

## Debugging Commands

### Check User Status:
```javascript
// In Node.js console or script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const user = await prisma.user.findFirst({
  where: { email: 'user@example.com' },
  select: {
    id: true,
    email: true,
    subscriptionStatus: true,
    isPremium: true,
    stripeSubscriptionId: true,
    stripeCustomerId: true
  }
});

console.log(user);
```

### Check Stripe Subscription:
```javascript
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const subscription = await stripe.subscriptions.retrieve('sub_1SsVIbBj2yIrR2RD8Ak51Pf9');
console.log(subscription);
```

## Summary

The webhook handler has been significantly improved with:
- ✅ Better error handling and logging
- ✅ Multiple fallback methods to find users
- ✅ Verification of database updates
- ✅ Detailed logging for debugging
- ✅ Proper webhook response handling

The fixes should resolve the issue where subscriptions were created in Stripe but not reflected in the database.
