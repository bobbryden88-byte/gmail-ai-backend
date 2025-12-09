# 🗑️ Clear Vercel Build Cache - CRITICAL STEP

## ⚠️ The Problem

Vercel is using **cached build artifacts** that have the old Prisma client (without `googleId` column). Even though we added the columns to the database, Vercel's Prisma client doesn't know about them.

## ✅ The Solution: Clear Build Cache

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click**: Your **gmail-ai-backend** project
3. **Go to**: **Deployments** tab
4. **Find**: The latest deployment (top of list)
5. **Click**: The **three dots** (⋯) menu on the right
6. **Click**: **"Redeploy"**
7. **IMPORTANT**: **UNCHECK** ✅ "Use existing Build Cache"
8. **Click**: **"Redeploy"** button
9. **Wait**: 2-3 minutes for deployment to complete

### Method 2: Via Vercel CLI (If you have it)

```bash
vercel --prod --force
```

The `--force` flag clears the build cache.

## 🔍 How to Verify It Worked

After redeploy completes:

1. **Check build logs** - Should see:
   ```
   Running "npm install"
   Running "npx prisma generate"
   Generated Prisma Client
   Running "npx prisma migrate deploy"
   ```

2. **Test the endpoint**:
   ```bash
   curl -X POST https://gmail-ai-backend.vercel.app/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","googleId":"test123","name":"Test"}'
   ```

3. **Should return**:
   ```json
   {
     "success": true,
     "message": "Google authentication successful",
     ...
   }
   ```

   **NOT** the `column does not exist` error!

## 📋 Why This Is Necessary

- ✅ Database has the columns (we added them manually)
- ✅ Schema file has the columns (we verified)
- ❌ **Vercel's Prisma client is cached** (old version without columns)

Clearing the cache forces Vercel to:
1. Reinstall dependencies
2. Regenerate Prisma client from schema
3. Apply migrations
4. Use the fresh Prisma client

---

**This is the critical step that will fix the login issue!** 🎯
