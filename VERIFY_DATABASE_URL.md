# 🔍 How to Verify DATABASE_URL Format

## Current Issue

Your `DATABASE_URL` in Vercel starts with `napi_` which is unusual. It should start with `postgresql://`.

## ✅ Correct Format

PostgreSQL connection strings should look like:

```
postgresql://username:password@host:port/database?sslmode=require
```

**Example formats:**

### Neon Database:
```
postgresql://user:password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Supabase:
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### Railway:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

## 🔍 How to Verify Your Current DATABASE_URL

### Step 1: Check Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Click the **eye icon** (👁️) to reveal the value
4. Check if it starts with `postgresql://`

### Step 2: Get the Correct Connection String

#### If using Neon:
1. Go to [neon.tech](https://neon.tech)
2. Sign in and select your project
3. Click **Connection Details** (or **Dashboard** → **Connection String**)
4. Copy the **Connection String** (NOT the API token)
5. It should start with `postgresql://`

#### If using Supabase:
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Copy the **URI** (starts with `postgresql://`)

#### If using Railway:
1. Go to [railway.app](https://railway.app)
2. Select your PostgreSQL service
3. Go to **Variables** tab
4. Find `DATABASE_URL` or `POSTGRES_URL`
5. Copy the value (should start with `postgresql://`)

## 🔧 How to Fix

### If Your DATABASE_URL is Wrong:

1. **Get the correct connection string** from your database provider (see above)
2. **Go to Vercel** → Settings → Environment Variables
3. **Find `DATABASE_URL`**
4. **Click Edit** (pencil icon)
5. **Replace the value** with the correct connection string
6. **Click Save**
7. **Redeploy** your application

### If You Don't Have a Database Yet:

#### Option 1: Neon (Free, Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Sign up (free)
3. Create a new project
4. Copy the connection string
5. Add to Vercel as `DATABASE_URL`

#### Option 2: Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get connection string from Settings → Database
4. Add to Vercel as `DATABASE_URL`

#### Option 3: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Get connection string from Variables
5. Add to Vercel as `DATABASE_URL`

## 🧪 Test Database Connection

After updating `DATABASE_URL`, test it:

```bash
# Test if backend can connect to database
curl https://gmail-ai-backend.vercel.app/health
```

If you see database errors in Vercel logs, the connection string is likely wrong.

## ⚠️ Common Issues

### Issue: `napi_` prefix
- **Problem:** This looks like a Neon API token, not a connection string
- **Fix:** Get the actual PostgreSQL connection string from Neon dashboard

### Issue: Connection refused
- **Problem:** Database might not allow connections from Vercel IPs
- **Fix:** Some databases need IP whitelisting (Neon/Supabase usually don't)

### Issue: SSL required
- **Problem:** Missing `?sslmode=require` in connection string
- **Fix:** Add `?sslmode=require` at the end

## 📝 Quick Checklist

- [ ] DATABASE_URL starts with `postgresql://`
- [ ] Contains username, password, host, port, database name
- [ ] Has `?sslmode=require` at the end (for cloud databases)
- [ ] Updated in Vercel environment variables
- [ ] Redeployed after updating

---

**After fixing DATABASE_URL, your login should work!**
