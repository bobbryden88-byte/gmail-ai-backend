# Stripe Webhook Verification Checklist

## ✅ FIXED: Webhook Handler Location & Code

### Webhook Endpoint Location
**File:** `src/app.js` (lines 81-113)  
**Path:** `POST /api/stripe/webhook`  
**Full URL:** `https://<your-vercel-domain>/api/stripe/webhook`

### Current Code (Fixed)
```javascript
// ----- STRIPE WEBHOOK (must be BEFORE express.json()) -----
// Stripe requires the RAW body for signature verification. express.json() consumes
// the body, so we handle the webhook here with express.raw() and never touch json.
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('🔔 [STRIPE WEBHOOK] POST /api/stripe/webhook received');
    try {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        console.error('❌ [STRIPE WEBHOOK] Missing Stripe-Signature header');
        return res.status(400).json({ error: 'Missing Stripe signature' });
      }
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('❌ [STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET not set');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }
      console.log('📩 [STRIPE WEBHOOK] Processing event (raw body length:', req.body?.length ?? 0, ')');
      const result = await StripeService.handleWebhook(req.body, signature);
      console.log('✅ [STRIPE WEBHOOK] Processed successfully:', result?.message ?? 'ok');
      return res.status(200).json({ received: true, success: true, message: result?.message ?? 'Webhook processed' });
    } catch (err) {
      console.error('❌ [STRIPE WEBHOOK] Error:', err.message);
      console.error('❌ [STRIPE WEBHOOK] Stack:', err.stack);
      return res.status(200).json({
        received: true,
        error: err.message,
        note: 'Error logged; 200 returned to avoid Stripe retries',
      });
    }
  }
);
```

### Key Fix Applied
- ✅ Webhook route is **BEFORE** `express.json()` (line 81-113 vs line 115)
- ✅ Uses `express.raw()` to preserve raw body for signature verification
- ✅ Logs at the **very beginning** - you'll see `🔔 [STRIPE WEBHOOK]` in logs
- ✅ Checks for `STRIPE_WEBHOOK_SECRET` and logs if missing

---

## 1. Verify Webhook Secret in Vercel

### Steps:
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for: `STRIPE_WEBHOOK_SECRET`
3. **Value should be:** `whsec_...` (starts with `whsec_`)

### If Missing or Wrong:
1. Go to **Stripe Dashboard** → [Webhooks](https://dashboard.stripe.com/webhooks)
2. Find your webhook endpoint (or create it)
3. Click on the endpoint → **Reveal** the signing secret
4. Copy the `whsec_...` value
5. In Vercel, add/update `STRIPE_WEBHOOK_SECRET` with that value
6. **Redeploy** your project (env vars only take effect after redeploy)

### Verify in Code:
The webhook handler checks for this at line 95-98:
```javascript
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.error('❌ [STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET not set');
  return res.status(500).json({ error: 'Webhook secret not configured' });
}
```

If you see this error in logs, the secret isn't set.

---

## 2. Verify Webhook Endpoint Path

### Current Configuration:
- **Vercel Route:** All requests → `/api/index.js` (from `vercel.json`)
- **Express Route:** `POST /api/stripe/webhook` (in `src/app.js`)
- **Full URL:** `https://<your-vercel-domain>/api/stripe/webhook`

### Stripe Dashboard Configuration:
1. Go to **Stripe Dashboard** → [Webhooks](https://dashboard.stripe.com/webhooks)
2. Your endpoint URL should be: `https://<your-vercel-domain>/api/stripe/webhook`
3. **Important:** Use the **exact** domain from your Vercel deployment
   - Example: `https://gmail-ai-backend.vercel.app/api/stripe/webhook`
   - Or your custom domain if configured

### Test the Endpoint:
```bash
# Test if endpoint is reachable (should return 400 - missing signature, but that's OK)
curl -X POST https://<your-vercel-domain>/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Expected response: `{"error":"Missing Stripe signature"}` (400 status)

If you get 404, the route isn't registered correctly.

---

## 3. What Logs to Expect

### When Webhook is Received (Success):
```
2025-01-XX... - POST /api/stripe/webhook
🔔 [STRIPE WEBHOOK] POST /api/stripe/webhook received
📩 [STRIPE WEBHOOK] Processing event (raw body length: 1234)
📩 Processing webhook event: checkout.session.completed
🔔 WEBHOOK: checkout.session.completed
Session ID: cs_test_...
Customer: cus_...
Customer Email: user@example.com
Metadata: { "userId": "...", "planType": "monthly" }
Subscription ID: sub_...
✅ Using userId from metadata: clxxx...
Processing checkout for user: user@example.com (clxxx...), current status: none
Retrieving subscription from Stripe: sub_...
Subscription details: { id: 'sub_...', status: 'trialing', ... }
Updating user clxxx... subscription in database...
✅ Database update successful
✅ User clxxx... (user@example.com) subscription successfully updated!
Updated subscription status: trialing
Updated isPremium: true
Updated stripeSubscriptionId: sub_...
✅ [STRIPE WEBHOOK] Processed successfully: Checkout completed and user subscription updated
```

### When Webhook Fails (Error):
```
🔔 [STRIPE WEBHOOK] POST /api/stripe/webhook received
❌ [STRIPE WEBHOOK] Error: No signatures found matching the expected signature for payload
❌ [STRIPE WEBHOOK] Stack: ...
```

### If Webhook Secret Missing:
```
🔔 [STRIPE WEBHOOK] POST /api/stripe/webhook received
❌ [STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET not set
```

### If No Logs at All:
- **Check Vercel logs** → Filter by "webhook" or "STRIPE WEBHOOK"
- **Check Stripe Dashboard** → Webhooks → Your endpoint → View recent deliveries
- If Stripe shows "Failed" or "No response", the endpoint isn't reachable

---

## 4. Database Update Verification

### Fields Updated by Webhook:
The `updateUserSubscription()` function (in `src/services/stripe.js:401-430`) updates:

| Database Field | Source | Example Value |
|----------------|--------|---------------|
| `isPremium` | `subscription.status === 'active' \|\| 'trialing'` | `true` |
| `stripeCustomerId` | `subscription.customer` | `cus_...` |
| `stripeSubscriptionId` | `subscription.id` | `sub_...` |
| `subscriptionStatus` | `subscription.status` | `'trialing'` or `'active'` |
| `trialActive` | `subscription.status === 'trialing'` | `true` |
| `trialStartDate` | `subscription.trial_start` (converted from Unix) | `2025-01-XX...` |
| `trialEndDate` | `subscription.trial_end` (converted from Unix) | `2025-01-XX...` |
| `planType` | From session metadata | `'monthly'` or `'yearly'` |

### Verify Database Update:
```sql
-- Check user subscription status
SELECT 
  id, 
  email, 
  subscriptionStatus, 
  isPremium, 
  stripeSubscriptionId,
  trialStartDate,
  trialEndDate
FROM users 
WHERE email = 'user@example.com';
```

After webhook processes, you should see:
- `subscriptionStatus`: `'trialing'` or `'active'`
- `isPremium`: `true`
- `stripeSubscriptionId`: `sub_...` (matches Stripe subscription ID)

---

## 5. Status Endpoint Verification

### Endpoint: `GET /api/trial/status`
**File:** `src/routes/trial.js`

### Fields It Reads:
- ✅ `subscriptionStatus` → `subscription_status` in response
- ✅ `isPremium` → `is_premium` / `has_full_access` in response
- ✅ `stripeSubscriptionId` → `stripe_subscription_id` / `has_subscription` in response
- ✅ `trialStartDate`, `trialEndDate` → `trial_start_date`, `trial_end_date`

**These match the fields updated by the webhook!** ✅

### Test:
```bash
curl -X GET https://<your-vercel-domain>/api/trial/status \
  -H "Authorization: Bearer <your-jwt-token>"
```

Expected response after webhook:
```json
{
  "success": true,
  "subscription_status": "trialing",
  "is_premium": true,
  "has_full_access": true,
  "stripe_subscription_id": "sub_...",
  "has_subscription": true
}
```

---

## 6. Complete Flow Verification

### Expected Flow:
1. ✅ User completes checkout → Stripe creates subscription
2. ✅ Stripe sends `checkout.session.completed` webhook to `/api/stripe/webhook`
3. ✅ **Webhook handler receives request** → Logs: `🔔 [STRIPE WEBHOOK] POST /api/stripe/webhook received`
4. ✅ **Signature verified** → Logs: `📩 [STRIPE WEBHOOK] Processing event`
5. ✅ **Event processed** → Logs: `📩 Processing webhook event: checkout.session.completed`
6. ✅ **User found** → Logs: `✅ Using userId from metadata: ...`
7. ✅ **Subscription retrieved** → Logs: `Subscription details: {...}`
8. ✅ **Database updated** → Logs: `✅ Database update successful`
9. ✅ **Status endpoint returns updated data** → Frontend shows "Pro"

### If Step 3 Fails (No Logs):
- **Check Stripe Dashboard** → Webhooks → Your endpoint → Recent deliveries
- **Check endpoint URL** matches exactly (no trailing slash, correct domain)
- **Check Vercel logs** → Filter by "POST /api/stripe/webhook"

### If Step 4 Fails (Signature Error):
- **Check `STRIPE_WEBHOOK_SECRET`** in Vercel matches Stripe Dashboard
- **Redeploy** after changing env vars
- **Check** you're using the correct secret for the correct endpoint (test vs live)

### If Step 8 Fails (DB Not Updated):
- **Check database connection** → `DATABASE_URL` in Vercel
- **Check Prisma** → Run `npx prisma generate` in build
- **Check logs** for database errors

---

## Quick Debug Commands

### Check Webhook Secret:
```bash
# In Vercel CLI or check dashboard
echo $STRIPE_WEBHOOK_SECRET  # Should show whsec_...
```

### Test Webhook Locally:
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Trigger test event
stripe trigger checkout.session.completed
```

### Check Recent Webhook Deliveries:
1. **Stripe Dashboard** → Webhooks → Your endpoint → Recent deliveries
2. Click on a delivery → See request/response
3. If "Failed", check the error message

---

## Summary

✅ **Webhook endpoint:** `POST /api/stripe/webhook` in `src/app.js` (BEFORE `express.json()`)  
✅ **Raw body handling:** Uses `express.raw()` for signature verification  
✅ **Logging:** Comprehensive logs starting with `🔔 [STRIPE WEBHOOK]`  
✅ **Database updates:** Updates all required fields via `updateUserSubscription()`  
✅ **Status endpoint:** Reads the same fields updated by webhook  

**Next Steps:**
1. Verify `STRIPE_WEBHOOK_SECRET` in Vercel
2. Verify webhook URL in Stripe Dashboard matches your Vercel domain
3. Redeploy if you changed env vars
4. Check Vercel logs for `🔔 [STRIPE WEBHOOK]` messages
5. Test with a real checkout session
