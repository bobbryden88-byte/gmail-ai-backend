# 🔑 Add OpenAI API Key to Vercel

## Steps to Add OpenAI API Key to Vercel

### Step 1: Get Your OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click **"Create new secret key"** (or use an existing one)
4. Copy the key (starts with `sk-proj-` or `sk-`)

### Step 2: Go to Vercel Environment Variables

1. Visit: https://vercel.com/dashboard
2. Click: **gmail-ai-backend** project
3. Click: **Settings** (top navigation)
4. Click: **Environment Variables** (left sidebar)

### Step 3: Add the Key

1. Click: **"Add New"** button
2. **Key:** `OPENAI_API_KEY`
3. **Value:** Paste your OpenAI API key (starts with `sk-proj-` or `sk-`)
4. **Environment:** Select all three:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click: **Save**

### Step 3: Redeploy

1. Go to: **Deployments** tab
2. Find: **Latest deployment**
3. Click: **Three dots** (⋯) → **Redeploy**
4. Wait: 2-3 minutes for deployment

### Step 4: Test

After redeploy, try generating an email response again. It should work!

## Verify It's Set

After redeploy, check Vercel logs:

1. Go to: **Deployments** → **Latest**
2. Click: **Function Logs**
3. Try generating a response
4. Look for: `hasApiKey: true` (should be true now)

---

**Once you add the key and redeploy, AI generation should work!** ✅
