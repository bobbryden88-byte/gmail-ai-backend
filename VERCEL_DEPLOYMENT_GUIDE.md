# 🚀 Deploy Backend to Vercel - Step by Step Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Your backend code pushed to GitHub

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Sign up / Log in to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Sign in with your GitHub account

### Step 2: Import Your Repository
1. Click "Add New..." → "Project"
2. Find your `gmail-ai-backend` repository
3. Click "Import"

### Step 3: Configure Project Settings
Vercel should auto-detect Node.js. Verify these settings:

**Framework Preset:** Other  
**Root Directory:** `./` (leave as default)  
**Build Command:** `npm run build` or leave empty  
**Output Directory:** Leave empty  
**Install Command:** `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add these (get values from your `.env` file):

**Required:**
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=production
PORT=3000
```

**Optional (if using):**
```
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for deployment
3. Vercel will give you a URL like: `https://gmail-ai-backend-xxxxx.vercel.app`

### Step 6: Test Deployment
```bash
curl https://your-vercel-url.vercel.app/health
```

Should return: `{"status":"OK","timestamp":"..."}`

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
cd /Users/bobbryden/gmail-ai-backend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time) or **Yes** (updates)
- Project name? **gmail-ai-backend**
- Directory? **./** (press Enter)

### Step 4: Add Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add OPENAI_API_KEY
# ... add all other variables
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

## 🔄 Updating Your Deployment

### Automatic (via GitHub)
- Push to `main` branch → Vercel auto-deploys

### Manual (via CLI)
```bash
vercel --prod
```

## 📝 Important Notes

### Database Setup
Vercel doesn't provide databases. You need:
- **PostgreSQL:** Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
- Get connection string and add to `DATABASE_URL` env var

### Prisma Migrations
Vercel will run `prisma generate` during build. For migrations:
1. Run locally: `npx prisma migrate deploy`
2. Or add to build script in `package.json`

### Custom Domain
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `gmail-ai-backend.vercel.app`)
3. Follow DNS setup instructions

## ✅ Verify Deployment

1. **Health Check:**
   ```bash
   curl https://your-vercel-url.vercel.app/health
   ```

2. **Test API:**
   ```bash
   curl -X POST https://your-vercel-url.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test"}'
   ```

3. **Check Logs:**
   - Vercel Dashboard → Your Project → Deployments → Click deployment → View Function Logs

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)

### Environment Variables Not Working
- Make sure variables are added for "Production" environment
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Some databases need IP whitelisting

### CORS Errors
- Already fixed in `src/app.js` to allow Gmail origins
- If issues persist, check CORS config in deployment

## 🎯 Next Steps

After deployment:
1. Update extension to use Vercel URL
2. Test the full flow (sign in → generate AI response)
3. Monitor Vercel dashboard for errors
4. Set up custom domain (optional)

---

**Your backend will be live at:** `https://gmail-ai-backend.vercel.app` (or your custom domain)
