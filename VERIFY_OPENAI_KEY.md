# ✅ Verify OpenAI API Key in Vercel

## Current Issue

AI generation is failing with:
```
Backend Error: Backend API error: 500 - {"error":"Failed to generate response"}
```

## Most Likely Cause

The `OPENAI_API_KEY` environment variable is **missing or invalid** in Vercel.

## Quick Check

### Step 1: Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click: **gmail-ai-backend** project
3. Go to: **Settings** → **Environment Variables**
4. Search for: `OPENAI_API_KEY`

**What to look for:**
- ✅ Key exists and starts with `sk-proj-` or `sk-`
- ✅ Set for **Production, Preview, Development**
- ❌ Missing or empty

### Step 2: If Missing - Add It

1. **Get your OpenAI API key:**
   - Go to: https://platform.openai.com/api-keys
   - Sign in to your OpenAI account
   - Click **"Create new secret key"**
   - Copy the key (starts with `sk-proj-`)

2. **Add to Vercel:**
   - In Vercel: **Settings** → **Environment Variables**
   - Click: **"Add New"**
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Paste your OpenAI API key
   - **Environment:** Select **Production, Preview, Development** (all three)
   - Click: **Save**

3. **Redeploy:**
   - Go to: **Deployments**
   - Click: **Latest** → **Redeploy**
   - Wait 2-3 minutes

### Step 3: Check Vercel Logs After Redeploy

1. Go to: **Deployments** → **Latest**
2. Click: **Function Logs**
3. Try generating an email response
4. Look for:
   - ✅ `hasApiKey: true` = Key is set correctly
   - ❌ `hasApiKey: false` = Key is missing
   - ❌ `OpenAI API Error:` = Shows the actual error

## Common Errors

### Error: "API key not found"
- **Fix:** Add `OPENAI_API_KEY` to Vercel

### Error: "Invalid API key"
- **Fix:** Generate a new key from OpenAI dashboard

### Error: "Rate limit exceeded"
- **Fix:** Wait a few minutes or upgrade OpenAI plan

### Error: "Insufficient quota"
- **Fix:** Add credits to your OpenAI account

---

**After adding the key and redeploying, AI generation should work!** 🎯
