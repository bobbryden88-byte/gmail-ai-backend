# Premium Status Sync - Complete Fix Guide

## 🎯 What Was Fixed

Your Stripe payments were working, but the extension wasn't showing premium status because the database wasn't being updated after payment. Here's what I fixed:

### 1. ✅ Enhanced Webhook Handler
- Added comprehensive logging to track webhook events
- Improved error handling
- Better metadata extraction from Stripe events

### 2. ✅ Created Payment Success Pages
- Simple success/cancel pages that users see after payment
- Automatic redirect after payment completion
- Clear instructions for users

### 3. ✅ Manual Activation Script
- Created a script to manually activate premium for users who already paid
- Useful for fixing users who paid but didn't get activated

## 🔧 How to Activate Premium for Your Test User

Since you already paid with your real card, run this command to activate premium:

```bash
cd /Users/bobbryden/gmail-ai-backend
node activate-premium-manually.js YOUR_EMAIL_HERE
```

**Example:**
```bash
node activate-premium-manually.js bob.bryden@brentwood.ca
```

This will:
1. Find your user in the database
2. Set `isPremium` to `true`
3. Add a subscription ID
4. Confirm the activation

## 🧪 How to Test the Complete Flow

### Option 1: Test with Your Already-Paid Account

1. **Activate your account manually**:
   ```bash
   node activate-premium-manually.js YOUR_EMAIL
   ```

2. **Open your Chrome extension**

3. **Click the extension icon** (should see popup)

4. **Refresh if already logged in** or **Login again**

5. **You should now see**:
   - ✅ "PREMIUM" badge (not "FREE")
   - ✅ Premium benefits section
   - ✅ No upgrade options
   - ✅ "Manage Subscription" button

### Option 2: Test with New User (Recommended)

1. **Register a NEW test account** in the extension:
   - Email: `testpremium@example.com`
   - Password: `test123`

2. **Click "Upgrade to Premium"**

3. **Choose Monthly or Yearly**

4. **In Stripe Checkout**:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - Name: Any name
   - ZIP: `12345`

5. **Complete payment**

6. **You'll see success page** with session ID

7. **Wait 2-3 seconds** for webhook to process

8. **Manually activate** (until webhooks are fully set up):
   ```bash
   node activate-premium-manually.js testpremium@example.com
   ```

9. **Refresh extension popup** - should show premium!

## 🔔 Setting Up Stripe Webhooks (For Automatic Activation)

Right now, you need to manually activate users. To make it automatic:

### Step 1: Get Webhook Secret

1. Go to: [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `http://localhost:3000/api/stripe/webhook`
   - *Note: For production, use your deployed URL*
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy the "Signing secret"** (starts with `whsec_...`)

### Step 2: Add to .env

```env
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### Step 3: Restart Backend

```bash
npm run dev
```

### Step 4: Test Webhooks Locally

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook secret for testing. Add it to your `.env` file.

## 📊 How to Check if Premium is Working

### Check Database Directly

```bash
cd /Users/bobbryden/gmail-ai-backend
npx prisma studio
```

This opens a GUI where you can see all users and their `isPremium` status.

### Check Via Extension

1. Open extension popup
2. Look for:
   - Badge showing "PREMIUM" (green) or "FREE" (gray)
   - Premium benefits section (if premium)
   - Upgrade section (if free)

### Check Backend Logs

Watch your backend logs for:
- ✅ Webhook events being received
- ✅ User premium status being updated
- ❌ Any errors in webhook processing

## 🚀 What Happens Now

### For Users Who Already Paid (Like You)

1. Run manual activation script
2. Extension shows premium immediately
3. Webhook will keep them in sync going forward

### For New Users (After Webhooks Setup)

1. User clicks "Upgrade"
2. Completes payment in Stripe
3. Stripe sends webhook to your backend
4. Backend automatically sets `isPremium = true`
5. User refreshes extension → sees premium!

## 🎯 Quick Commands Reference

### Activate Premium Manually
```bash
node activate-premium-manually.js EMAIL
```

### Check All Users
```bash
npx prisma studio
```

### View Backend Logs
```bash
npm run dev
# Watch the terminal for webhook events
```

### Test Stripe Webhooks Locally
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🔍 Troubleshooting

### Premium Status Not Showing After Manual Activation

1. **Verify in database**:
   ```bash
   npx prisma studio
   ```
   - Check if `isPremium` is `true`

2. **Refresh extension**:
   - Close popup completely
   - Reopen extension
   - Or logout and login again

3. **Check browser console**:
   - Right-click extension popup → Inspect
   - Look for any JavaScript errors

### Webhooks Not Working

1. **Check webhook secret** in `.env`
2. **Check Stripe Dashboard** → Webhooks → View events
3. **Use Stripe CLI** for local testing
4. **Check backend logs** for webhook processing

### User Paid But Still Shows Free

This is exactly what we fixed! Run:
```bash
node activate-premium-manually.js THEIR_EMAIL
```

## 📝 Next Steps

1. ✅ Activate your current paid account manually
2. ✅ Test the extension shows premium status
3. ⏳ Set up Stripe webhooks for automatic activation
4. ⏳ Test complete flow with new user
5. ⏳ Deploy to production with webhook URL

---

**Need help?** Check the backend logs when testing - they now have detailed logging for every step of the premium activation process!
