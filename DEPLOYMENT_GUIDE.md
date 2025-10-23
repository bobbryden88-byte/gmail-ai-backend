# Production Deployment Guide

## Backend Deployment Options

### Option 1: Railway (Recommended - Easy & Free)
1. **Sign up at railway.app**
2. **Connect your GitHub repository**
3. **Add environment variables**:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-secure-jwt-secret
   OPENAI_API_KEY=your-openai-key
   STRIPE_SECRET_KEY=sk_live_your-live-stripe-key
   STRIPE_PUBLISHABLE_KEY=pk_live_your-live-stripe-key
   STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_your-monthly-price
   STRIPE_PREMIUM_YEARLY_PRICE_ID=price_your-yearly-price
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   DATABASE_URL=your-production-database-url
   SMTP_USER=your-email@domain.com
   SMTP_PASS=your-email-password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   FRONTEND_URL=https://your-domain.com
   ```

### Option 2: Heroku
1. **Create Heroku account**
2. **Install Heroku CLI**
3. **Deploy with Git**:
   ```bash
   heroku create your-app-name
   git push heroku main
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # ... add all environment variables
   ```

### Option 3: DigitalOcean App Platform
1. **Create DigitalOcean account**
2. **Create new app from GitHub**
3. **Configure environment variables**
4. **Deploy automatically**

## Database Setup (Production)

### Option 1: Railway PostgreSQL (Free tier)
- Automatically provisioned with Railway deployment
- Connection string provided automatically

### Option 2: Supabase (Free tier)
1. **Sign up at supabase.com**
2. **Create new project**
3. **Get connection string**
4. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

### Option 3: PlanetScale (Free tier)
1. **Sign up at planetscale.com**
2. **Create database**
3. **Get connection string**
4. **Run migrations**

## Stripe Production Setup

### 1. Switch to Live Mode
1. **Go to Stripe Dashboard**
2. **Toggle "Live mode"**
3. **Get live API keys**:
   - `sk_live_...` (Secret key)
   - `pk_live_...` (Publishable key)

### 2. Create Live Products
1. **Create monthly product** ($7.99 CAD)
2. **Create yearly product** ($79.99 CAD)
3. **Copy live Price IDs**
4. **Update environment variables**

### 3. Configure Webhooks
1. **Add webhook endpoint**: `https://your-domain.com/api/stripe/webhook`
2. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. **Copy webhook secret**

## Domain Setup

### Option 1: Custom Domain
1. **Buy domain** (Namecheap, GoDaddy, etc.)
2. **Point to your deployment**
3. **Update CORS settings**

### Option 2: Subdomain
- Use your deployment URL directly
- Update all references to production URL

## Security Checklist

- [ ] **HTTPS enabled** (automatic with most platforms)
- [ ] **Environment variables secured**
- [ ] **Database credentials protected**
- [ ] **Stripe keys in live mode**
- [ ] **CORS configured for production domain**
- [ ] **Rate limiting enabled**
- [ ] **Error logging configured**

## Testing Production

1. **Test all endpoints**:
   ```bash
   curl https://your-domain.com/health
   curl https://your-domain.com/api/auth/register
   ```

2. **Test Stripe integration**:
   - Create test subscription
   - Verify webhooks
   - Test cancellation

3. **Test AI functionality**:
   - Generate responses
   - Check usage tracking

## Monitoring

### Setup Logging
- **Railway**: Built-in logging
- **Heroku**: `heroku logs --tail`
- **DigitalOcean**: App Platform logs

### Error Tracking
- **Sentry** (free tier)
- **LogRocket** (free tier)
- **Built-in platform monitoring**

## Backup Strategy

1. **Database backups** (automatic with most providers)
2. **Code backups** (GitHub)
3. **Environment variables** (documented securely)
4. **Regular exports** of user data
