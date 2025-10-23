# Quick Backend Deployment for Chrome Web Store

## 🚀 Deploy to Railway (Recommended - 5 minutes)

### Step 1: Sign up at Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Connect your repository

### Step 2: Deploy
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your gmail-ai-backend repository
4. Railway will automatically detect it's a Node.js app

### Step 3: Add Environment Variables
In Railway dashboard, go to Variables tab and add:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-key-here
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=sk_live_your-live-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-live-stripe-key
STRIPE_PREMIUM_MONTHLY_PRICE_ID=your-monthly-price-id
STRIPE_PREMIUM_YEARLY_PRICE_ID=your-yearly-price-id
STRIPE_WEBHOOK_SECRET=your-webhook-secret
DATABASE_URL=postgresql://username:password@host:port/database
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=https://your-railway-domain.railway.app
```

### Step 4: Get Your URL
Railway will give you a URL like: `https://gmail-ai-backend-production.railway.app`

## 🔄 Update Extension for Production

### Update API URLs in Extension
1. Open `/Users/bobbryden/gmail-ai-assistant/utils/auth-service.js`
2. Change `const BASE_URL = 'http://localhost:3000';` to your Railway URL
3. Update all other localhost references

### Update Manifest Permissions
Add your production domain to manifest.json permissions.

## ✅ Test Production Backend
```bash
curl https://your-railway-domain.railway.app/health
```

## 🎯 Ready for Chrome Web Store!

Once deployed, you'll have:
- ✅ Production backend running
- ✅ Legal documents ready
- ✅ Extension package ready
- ✅ Google account approved

You can now submit to Chrome Web Store!
