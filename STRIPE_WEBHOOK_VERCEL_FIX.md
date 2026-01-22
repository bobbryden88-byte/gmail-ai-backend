# Stripe Webhook “No Logs” Fix – Vercel

## What was wrong

- Stripe webhook fired (`checkout.session.completed`), subscription created in Stripe.
- Database was **not** updated.
- **No webhook handler logs** in Vercel.

## Root cause: raw body vs `express.json()`

Stripe signature verification **requires the raw request body** (string or Buffer).  
Your app had:

1. **Global `app.use(express.json())`** – runs for **all** routes and **consumes** the body.
2. **Webhook route** inside the Stripe router using `express.raw({ type: 'application/json' })`.

Request flow:

1. Request hits `/api/stripe/webhook`.
2. **`express.json()` runs first** (global middleware) → parses and consumes the body.
3. Body is already parsed; by the time the webhook route runs, `req.body` is an **object**, not raw bytes.
4. `StripeService.handleWebhook(req.body, signature)` passes that object to `stripe.webhooks.constructEvent(...)`.
5. `constructEvent` expects **raw** body → **signature verification fails** → throws.
6. You return 200 in the `catch`, so Stripe doesn’t retry, but the DB is never updated.

In addition, if errors occurred very early (e.g. during verification), you might see little or no logging depending on where you looked.

## Fix applied

1. **Webhook route moved before `express.json()`**
   - New **app-level** route: `POST /api/stripe/webhook`.
   - Uses **only** `express.raw({ type: 'application/json' })` for that path.
   - Registered **before** `app.use(express.json())`, so the webhook **never** goes through the JSON parser.

2. **Webhook handler moved to `app.js`**
   - Handler lives in `src/app.js`.
   - Logs at the **very start**: `🔔 [STRIPE WEBHOOK] POST /api/stripe/webhook received`.
   - Checks `Stripe-Signature` and `STRIPE_WEBHOOK_SECRET` and logs clearly if missing.
   - Still returns 200 on error (after logging) so Stripe doesn’t retry unnecessarily.

3. **Stripe router**
   - Webhook route **removed** from `src/routes/stripe.js`.
   - Comment added: webhook is handled in `app.js` and must stay **before** `express.json()`.

## Webhook endpoint

| Item | Value |
|------|--------|
| **Method** | `POST` |
| **Path** | `/api/stripe/webhook` |
| **Full URL (Vercel)** | `https://<your-vercel-domain>/api/stripe/webhook` |
| **Stripe Dashboard** | Developers → Webhooks → Add endpoint → use the URL above |

## Vercel configuration

### 1. Environment variables

In **Vercel → Project → Settings → Environment Variables**, ensure:

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (e.g. `sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (e.g. `whsec_...`) from Stripe Dashboard |
| `DATABASE_URL` | PostgreSQL connection string |

`STRIPE_WEBHOOK_SECRET` must match the **exact** endpoint you configure in Stripe (including test vs live).

### 2. `vercel.json`

Your `vercel.json` sends all traffic to `/api/index.js`:

```json
{
  "routes": [{ "src": "/(.*)", "dest": "/api/index.js" }]
}
```

`api/index.js` exports the Express app. The webhook is `POST /api/stripe/webhook` on that app, so **no** change to `vercel.json` is required.

### 3. Stripe webhook setup

1. **Stripe Dashboard** → [Webhooks](https://dashboard.stripe.com/webhooks).
2. **Add endpoint**.
3. **Endpoint URL**: `https://<your-vercel-domain>/api/stripe/webhook`  
   (e.g. `https://gmail-ai-backend.vercel.app/api/stripe/webhook`).
4. **Events**: at least `checkout.session.completed`; add others you use (`customer.subscription.*`, `invoice.*`, etc.).
5. **Reveal** and copy the **Signing secret** (`whsec_...`).
6. Set `STRIPE_WEBHOOK_SECRET` in Vercel to that value and redeploy.

## What you’ll see in Vercel logs

When a webhook is received, you should see lines like:

```
... - POST /api/stripe/webhook
🔔 [STRIPE WEBHOOK] POST /api/stripe/webhook received
📩 [STRIPE WEBHOOK] Processing event (raw body length: 1234 )
📩 Processing webhook event: checkout.session.completed
...
✅ [STRIPE WEBHOOK] Processed successfully: Checkout completed and user subscription updated
```

If something fails (e.g. bad secret, missing `userId`):

```
❌ [STRIPE WEBHOOK] Error: ...
❌ [STRIPE WEBHOOK] Stack: ...
```

So the “no webhook logs” issue should be resolved: you always get at least the first log when the handler is hit.

## Status endpoint vs webhook

`GET /api/trial/status` (and `/api/stripe/trial-status`) read:

- `subscription_status` ← `user.subscriptionStatus`
- `stripe_subscription_id` ← `user.stripeSubscriptionId`
- `is_premium` / `has_full_access` ← `user.isPremium` and trial/active logic

The webhook’s `updateUserSubscription` updates exactly those fields (`subscriptionStatus`, `stripeSubscriptionId`, `isPremium`, trial dates, etc.). Once the webhook runs successfully, the status endpoints return the updated state.

## Quick checks

1. **Webhook URL**  
   Stripe endpoint URL = `https://<your-vercel-domain>/api/stripe/webhook` (no typo, same env).

2. **Secrets**  
   `STRIPE_WEBHOOK_SECRET` in Vercel = signing secret for **that** webhook endpoint.

3. **Redeploy**  
   After changing env vars, redeploy so the runtime has the new values.

4. **Logs**  
   Vercel → Project → Logs; filter by “webhook” or “STRIPE WEBHOOK” to confirm the handler runs.

## Local testing

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the CLI’s webhook secret in `.env` as `STRIPE_WEBHOOK_SECRET`, then trigger a `checkout.session.completed` (e.g. complete a test checkout). You should see the same `[STRIPE WEBHOOK]` logs locally.

## Summary

| Before | After |
|--------|--------|
| Webhook route after `express.json()` | Webhook route **before** `express.json()` |
| Body parsed as JSON → verification fails | Raw body → verification succeeds |
| No/few logs | Consistent `[STRIPE WEBHOOK]` logs |
| DB not updated | DB updated on `checkout.session.completed` |

The critical change is **order of middleware**: the webhook must receive the **raw** body and never go through `express.json()`.
