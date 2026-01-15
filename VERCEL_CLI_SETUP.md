# 🔧 Setting OPENAI_API_KEY via Vercel CLI

## Step 1: Verify Key Length
Your key should be **200 characters** (not 164).

## Step 2: Remove ALL existing keys via CLI

```bash
cd /Users/bobbryden/gmail-ai-backend

# Remove from all environments
npx vercel env rm OPENAI_API_KEY production
npx vercel env rm OPENAI_API_KEY preview
npx vercel env rm OPENAI_API_KEY development
```

When prompted, confirm deletion.

## Step 3: Add the key via CLI (no quotes, no spaces)

```bash
# For Production
npx vercel env add OPENAI_API_KEY production

# When prompted, paste your FULL key:
# YOUR_OPENAI_API_KEY_HERE (use your actual key from OpenAI dashboard)
# Press Enter

# For Preview
npx vercel env add OPENAI_API_KEY preview
# Paste the same key, press Enter

# For Development
npx vercel env add OPENAI_API_KEY development
# Paste the same key, press Enter
```

## Step 4: Verify it was added correctly

```bash
npx vercel env ls
```

Look for `OPENAI_API_KEY` - it should show the full key length.

## Step 5: Redeploy (WITHOUT build cache)

```bash
npx vercel --prod
```

Or in Vercel dashboard:
- Deployments → Latest → Redeploy
- **UNCHECK "Use existing Build Cache"**
- Redeploy

## Step 6: Test the debug endpoint

After deployment, test:
```bash
curl https://gmail-ai-backend.vercel.app/api/ai/debug-key \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Should show:
- `trimmedKeyLength: 200` ✅
- `keySuffix: "...ULL4_mmoA"` ✅
- `keyEndsCorrectly: true` ✅

---

## Important Notes:

1. **NO QUOTES** - Don't wrap the key in quotes when pasting
2. **NO SPACES** - Make sure there are no leading/trailing spaces
3. **NO NEWLINES** - The key should be on a single line
4. **FULL KEY** - The entire key should be pasted (200 characters)

The CLI bypasses any web UI limitations that might be truncating your key!
