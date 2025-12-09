# 🔐 How to Add GOOGLE_CLIENT_ID to Vercel

## Step-by-Step Guide

### Step 1: Get Your Google Client ID

You have two possible Client IDs. Check which one you're using:

1. **Option A:** `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`
2. **Option B:** `999965368356-p78tp9t2jq7priv0futlk20n7na1lcpq.apps.googleusercontent.com`

**To find your current Client ID:**
- Check your `.env` file: `GOOGLE_CLIENT_ID="..."`
- Or check your extension's manifest.json or auth code

### Step 2: Go to Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Click on your **gmail-ai-backend** project

### Step 3: Navigate to Environment Variables

1. Click the **Settings** tab (top navigation bar)
2. In the left sidebar, click **Environment Variables**

### Step 4: Add GOOGLE_CLIENT_ID

1. Click the **Add New** button (top right)
2. Fill in the form:
   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** Paste your Client ID (one of the two above)
   - **Environment:** 
     - ✅ Check **Production**
     - ✅ Check **Preview**  
     - ✅ Check **Development**
3. Click **Save**

### Step 5: Verify It Was Added

You should now see `GOOGLE_CLIENT_ID` in your environment variables list with:
- Key: `GOOGLE_CLIENT_ID`
- Value: `••••••••••••••••••••••••••••••••••••••••` (hidden for security)
- Environments: Production, Preview, Development

### Step 6: Redeploy

After adding the variable:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Select **Production**
5. Click **Redeploy**

**OR** just push a new commit to trigger auto-deployment.

## ✅ Verification

After redeploying, test the Google OAuth endpoint:

```bash
curl -X POST https://gmail-ai-backend.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","googleId":"test123","name":"Test"}'
```

If `GOOGLE_CLIENT_ID` is set correctly, you should get a response (even if it's an error about the user, not about missing config).

---

**That's it! Your Google OAuth should work after this.**
