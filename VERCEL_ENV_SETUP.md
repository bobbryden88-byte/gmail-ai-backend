# 🔧 Vercel Environment Variables Setup

## ✅ Local .env Verified

Your local `.env` file has been verified and contains:
```
GOOGLE_CLIENT_ID="999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com"
```

## 🚀 Add to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Select your **gmail-ai-backend** project

### Step 2: Navigate to Environment Variables
1. Click on your project
2. Go to **Settings** tab
3. Click **Environment Variables** in the left sidebar

### Step 3: Add GOOGLE_CLIENT_ID
1. Click **Add New** button
2. **Key:** `GOOGLE_CLIENT_ID`
3. **Value:** `999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com`
4. **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### Step 4: Redeploy
After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## ✅ Verification

After redeploying, verify the environment variable is loaded:
1. Check deployment logs for any errors
2. Test the Google OAuth endpoint:
   ```bash
   curl -X POST https://gmail-ai-backend.vercel.app/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"idToken":"test"}'
   ```
   (This will fail with "Invalid Google token" which confirms the endpoint is working)

## 📝 Important Notes

- **Never commit `.env` to Git** - It's already in `.gitignore` ✅
- **`env.template` is updated** - This is safe to commit and shows what variables are needed
- **Vercel environment variables** are encrypted and secure
- **Redeploy after adding** - Environment variables are loaded at build time

---

**Your Google Client ID:**
```
999965368356-p8902b0r0gpv4qmm8l2cnrmj9ur02tm5.apps.googleusercontent.com
```
