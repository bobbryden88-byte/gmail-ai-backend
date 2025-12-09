# ✅ Update DATABASE_URL in Vercel

## Your Correct Connection String

You found it! Here's your Neon connection string:

```
postgresql://neondb_owner:npg_ck59xrDZpGTB@ep-hidden-night-adgmydil-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Note:** This uses Neon's connection pooler (`-pooler` in the hostname), which is perfect for serverless functions like Vercel!

## 🔧 How to Update in Vercel

### Step 1: Go to Vercel Environment Variables
1. Visit [vercel.com](https://vercel.com)
2. Click on your **gmail-ai-backend** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Find DATABASE_URL
1. Look for `DATABASE_URL` in the list
2. Click the **Edit** button (pencil icon ✏️) next to it

### Step 3: Update the Value
1. **Delete** the old value: `napi_64h5o7xcv0zj8b3tnlloymg6r6waljktzb20gcczzl2i6b3sx2s118y7vry2vwuc`
2. **Paste** the new connection string:
   ```
   postgresql://neondb_owner:npg_ck59xrDZpGTB@ep-hidden-night-adgmydil-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
3. **Click Save**

### Step 4: Verify
After saving, you should see:
- Key: `DATABASE_URL`
- Value: `••••••••••••••••••••••••••••••••••••••••` (hidden)
- Environments: Production, Preview, Development

### Step 5: Redeploy
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy** → **Production**
4. Wait 2-3 minutes

## ✅ Test After Redeploy

```bash
# Test health endpoint
curl https://gmail-ai-backend.vercel.app/health

# Should return: {"status":"OK",...}
```

## 🎯 What This Fixes

- ✅ Database connection will work
- ✅ Login should work (can create/find users in database)
- ✅ Google OAuth should work (can store user data)
- ✅ All database operations will work

---

**After updating and redeploying, try logging in again - it should work now!**
