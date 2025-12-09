# 🔧 Force Prisma Client Regeneration on Vercel

## Problem

Even after adding database columns, Vercel's Prisma client still doesn't recognize them. This is because Prisma client is cached.

## Solution: Clear Build Cache and Redeploy

### Step 1: Clear Vercel Build Cache

1. Go to [vercel.com](https://vercel.com)
2. Click on **gmail-ai-backend** project
3. Go to **Settings** → **General**
4. Scroll down to **Build & Development Settings**
5. Look for **"Clear Build Cache"** or **"Redeploy"** option
6. Or go to **Deployments** → Click latest deployment → **Redeploy** → **Uncheck "Use existing Build Cache"**

### Step 2: Verify Build Command

Make sure `vercel.json` has:
```json
{
  "buildCommand": "npm install && npx prisma generate && npx prisma migrate deploy"
}
```

This ensures:
- ✅ Prisma client is regenerated (`prisma generate`)
- ✅ Migrations are applied (`prisma migrate deploy`)

### Step 3: Manual Prisma Regeneration (Alternative)

If automatic doesn't work, you can force Prisma to regenerate by:

1. **Add a dummy change to schema.prisma** (add a comment):
   ```prisma
   // Force regeneration - 2025-12-09
   model User {
     ...
   }
   ```

2. **Commit and push:**
   ```bash
   git add prisma/schema.prisma
   git commit -m "Force Prisma regeneration"
   git push
   ```

3. **This triggers a new deployment** with fresh Prisma client

### Step 4: Verify It Worked

After redeploy, test:
```bash
curl -X POST https://gmail-ai-backend.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","googleId":"test123","name":"Test"}'
```

Should return success (not the column error).

---

**The key is clearing the build cache so Prisma regenerates with the new schema!**
