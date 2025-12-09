# 🔐 Vercel Environment Variables Setup Guide

## ❌ Problem
Your backend is returning "Invalid token" because `JWT_SECRET` is not set in Vercel.

## ✅ Solution: Add Environment Variables

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Click on your **gmail-ai-backend** project

### Step 2: Navigate to Environment Variables
1. Click **Settings** tab (top navigation)
2. Click **Environment Variables** in the left sidebar

### Step 3: Add Required Variables

Click **Add New** for each variable below:

#### 1. JWT_SECRET (REQUIRED - Most Important!)
- **Key:** `JWT_SECRET`
- **Value:** Generate a secure random string (see below)
- **Environment:** Select **Production**, **Preview**, and **Development**
- Click **Save**

**Generate JWT_SECRET:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32

# Option 3: Use online generator
# Visit: https://randomkeygen.com/
# Use "CodeIgniter Encryption Keys" - 256-bit
```

**Example JWT_SECRET:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```
(Make it long and random - at least 32 characters)

#### 2. DATABASE_URL (REQUIRED)
- **Key:** `DATABASE_URL`
- **Value:** Your PostgreSQL connection string
- **Format:** `postgresql://username:password@host:port/database`
- **Environment:** Production, Preview, Development
- **Where to get it:**
  - [Neon](https://neon.tech) - Free PostgreSQL
  - [Supabase](https://supabase.com) - Free tier available
  - [Railway](https://railway.app) - PostgreSQL addon

**Example:**
```
postgresql://user:password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 3. OPENAI_API_KEY (REQUIRED)
- **Key:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key (starts with `sk-`)
- **Environment:** Production, Preview, Development
- **Get it from:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

#### 4. NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production only

#### 5. PORT (Optional)
- **Key:** `PORT`
- **Value:** `3000`
- **Environment:** Production, Preview, Development
- (Vercel sets this automatically, but you can add it)

### Optional Variables (if using these features):

#### Stripe (if using payments)
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_PREMIUM_MONTHLY_PRICE_ID` - Monthly subscription price ID
- `STRIPE_PREMIUM_YEARLY_PRICE_ID` - Yearly subscription price ID
- `STRIPE_WEBHOOK_SECRET` - Webhook secret

#### Email Service (if using password reset)
- `SMTP_USER` - Email address
- `SMTP_PASS` - Email password or app password
- `SMTP_HOST` - e.g., `smtp.gmail.com`
- `SMTP_PORT` - e.g., `587`

#### Google OAuth (if using)
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID

### Step 4: Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Select **Production** environment
5. Click **Redeploy**

**OR** just push a new commit to trigger auto-deployment:
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push
```

## ✅ Verify Setup

After redeploying, test:

```bash
# Health check (should work without auth)
curl https://gmail-ai-backend.vercel.app/health

# Should return:
# {"status":"OK","timestamp":"...","environment":"production","vercel":true}
```

## 🔍 Troubleshooting

### "Invalid token" error persists
1. **Check JWT_SECRET is set:**
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure `JWT_SECRET` exists and is set for Production

2. **Sign in again:**
   - The old token was signed with a different secret
   - Click extension icon → Sign in again
   - This creates a new token with the correct secret

3. **Check Vercel logs:**
   - Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → View Function Logs
   - Look for errors about JWT_SECRET

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Some databases need IP whitelisting (Neon/Supabase usually don't)

### OpenAI API errors
- Verify `OPENAI_API_KEY` is correct
- Check API key has credits/billing set up
- Verify key hasn't been revoked

## 📝 Quick Checklist

- [ ] `JWT_SECRET` added (most important!)
- [ ] `DATABASE_URL` added
- [ ] `OPENAI_API_KEY` added
- [ ] `NODE_ENV=production` added
- [ ] Redeployed after adding variables
- [ ] Tested health endpoint
- [ ] Signed in again in extension (to get new token)

---

**After completing these steps, your backend should work correctly!** 🎉
