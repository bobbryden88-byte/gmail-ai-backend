# 🔍 Check for Duplicate OPENAI_API_KEY in Vercel

## The Problem

Your debug endpoint shows a key ending with `...s_YA`, but your Vercel dashboard shows a key ending with `...ULL4_mmoA`. This means **Vercel is using a different key than what you see in the UI**.

## Most Likely Cause: Duplicate Environment Variables

Vercel might have multiple `OPENAI_API_KEY` entries, and it's using the wrong one.

## How to Check:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `gmail-ai-backend`

2. **Navigate to Settings:**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Search for OPENAI_API_KEY:**
   - Use the search box or scroll through the list
   - Look for **ALL** entries named `OPENAI_API_KEY`

4. **Check Each Entry:**
   - Click on each `OPENAI_API_KEY` entry
   - Check which environments it's assigned to:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - **Check the value** - does it end with `...ULL4_mmoA` or `...s_YA`?

5. **If You Find Multiple Entries:**
   - **Delete ALL of them** (even if they look correct)
   - Then re-add ONE entry with:
     - Key: `OPENAI_API_KEY`
     - Value: `YOUR_OPENAI_API_KEY_HERE` (use your actual key from OpenAI dashboard)
     - Environments: ✅ Production, ✅ Preview, ✅ Development

6. **After Deleting and Re-adding:**
   - Go to **Deployments**
   - Click on the latest deployment
   - Click **Redeploy**
   - **UNCHECK "Use existing Build Cache"**
   - Click **Redeploy**

## Alternative: Check via Vercel API

If you have a Vercel API token, you can check programmatically:

```bash
curl "https://api.vercel.com/v9/projects/YOUR_PROJECT_ID/env" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" | jq '.envs[] | select(.key == "OPENAI_API_KEY")'
```

---

**The key ending with `...s_YA` is definitely wrong and needs to be removed!**
