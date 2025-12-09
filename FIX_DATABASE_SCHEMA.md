# 🔧 Fix: Database Schema Missing Columns

## ❌ Problem Found

The error shows:
```
The column `users.googleId` does not exist in the current database.
```

**This means:** Your production database doesn't have the `googleId` and `authProvider` columns that the code expects.

## ✅ Solution: Run Database Migrations

I've updated `vercel.json` to automatically run migrations during deployment. But you can also run them manually.

### Option 1: Automatic (Recommended)

The next deployment will automatically run migrations. Just:

1. **Redeploy on Vercel:**
   - Go to Deployments → Latest → Redeploy
   - Or push a new commit

2. **Migrations will run automatically** during build

### Option 2: Manual Migration (If Needed)

If automatic doesn't work, you can run migrations manually:

#### Using Prisma CLI:
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://neondb_owner:npg_ck59xrDZpGTB@ep-hidden-night-adgmydil-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Run migrations
npx prisma migrate deploy
```

#### Or use Neon's SQL Editor:
1. Go to Neon dashboard
2. Click on your database
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Add googleId column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;

-- Add authProvider column  
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authProvider" TEXT;

-- Create unique index on googleId
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");
```

## 📋 What Columns Are Missing

Based on your Prisma schema, these columns should exist:
- `googleId` (TEXT, unique, nullable)
- `authProvider` (TEXT, nullable)

## ✅ After Fixing

1. **Redeploy** on Vercel
2. **Test login** again
3. **Check Vercel logs** - should see successful user creation/lookup

---

**The updated vercel.json will run migrations automatically on the next deployment!**
