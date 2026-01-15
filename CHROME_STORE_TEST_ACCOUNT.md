# 🔐 Chrome Web Store Test Account Setup

## Test Credentials for Reviewers

**Username:** `store.test@inkwell.ai`  
**Password:** `StoreTest2025!`

---

## Option 1: Register via Extension (Recommended)

1. Install your extension locally
2. Open Gmail and click the extension icon
3. Click "Register" or "Sign Up"
4. Enter:
   - Email: `store.test@inkwell.ai`
   - Password: `StoreTest2025!`
   - Name: `Chrome Store Test`
5. After registration, upgrade to premium (see below)

---

## Option 2: Register via API

Run this command to create the account via API:

```bash
curl -X POST https://gmail-ai-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "store.test@inkwell.ai",
    "password": "StoreTest2025!",
    "name": "Chrome Store Test Account"
  }'
```

Then upgrade to premium:

```bash
# First, get your Vercel DATABASE_URL from Vercel dashboard
# Then run this locally with DATABASE_URL set:

export DATABASE_URL="your-vercel-postgres-url-here"
cd /Users/bobbryden/gmail-ai-backend
node create-store-test-account.js
```

---

## Option 3: Create Manually in Database

If you have database access, create the account directly:

1. Connect to your Neon/PostgreSQL database
2. Run this SQL (password hash for `StoreTest2025!`):

```sql
INSERT INTO users (id, email, name, password, "isPremium", "dailyUsage", "monthlyUsage", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'store.test@inkwell.ai',
  'Chrome Store Test Account',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', -- This is a placeholder, use bcrypt to generate
  true,
  0,
  0,
  NOW(),
  NOW()
);
```

**Note:** You'll need to generate the bcrypt hash for `StoreTest2025!` first.

---

## Quick Setup (Easiest)

1. **Register via extension:**
   - Email: `store.test@inkwell.ai`
   - Password: `StoreTest2025!`

2. **Upgrade to premium:**
   - Use the `activate-premium-manually.js` script:
   ```bash
   cd /Users/bobbryden/gmail-ai-backend
   # Set DATABASE_URL to your Vercel production URL
   export DATABASE_URL="your-production-database-url"
   node activate-premium-manually.js store.test@inkwell.ai
   ```

---

## For Chrome Web Store Submission

Once the account is created, go to:

1. **Chrome Web Store Developer Dashboard**
2. Select your extension
3. Go to **"Test instructions"** tab
4. Enter:
   - **Username:** `store.test@inkwell.ai`
   - **Password:** `StoreTest2025!`
5. Click **Save**

---

## Verify Account Works

Test the login:
1. Open your extension
2. Click "Login"
3. Enter: `store.test@inkwell.ai` / `StoreTest2025!`
4. Should see premium status and full access

---

**Account Details:**
- ✅ Premium access enabled
- ✅ Full feature testing available
- ✅ Ready for Chrome Web Store reviewers
