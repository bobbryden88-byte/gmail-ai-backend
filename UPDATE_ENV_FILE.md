# 📝 Update .env File with Vercel Environment Variables

## 🔄 Sync Local .env with Vercel

To keep your local development environment in sync with production, update your `.env` file with the values from Vercel.

## 📋 Values to Update

Copy these values from your Vercel dashboard and update your local `.env` file:

### 1. JWT_SECRET
```bash
JWT_SECRET="86b2570f885a6455b8be7a059e97fc7ca86bab1a27a4dc1a2057d6e9c5e8b899"
```
*(This is the value we generated earlier - use the same one from Vercel)*

### 2. DATABASE_URL
```bash
DATABASE_URL="napi_64h507xcv0zj8b3tnlloymg6r6waljktzb20gcczzl2i6b3sx2s118y7vry2vwuc"
```
*(Copy the exact value from Vercel - but verify it's the correct format)*

**Note:** If this doesn't start with `postgresql://`, you might need to get the actual connection string from your database provider.

### 3. OPENAI_API_KEY
```bash
OPENAI_API_KEY="your-openai-api-key-here"
```
*(Copy the exact value from Vercel - do not commit real keys to Git)*

### 4. NODE_ENV
```bash
NODE_ENV="development"
```
*(Keep as "development" for local, "production" is only for Vercel)*

## 🔧 How to Update

### Option 1: Manual Edit
1. Open `/Users/bobbryden/gmail-ai-backend/.env` in your editor
2. Update the values above
3. Save the file

### Option 2: Use This Script
I can help you update it programmatically - just confirm you want me to update the file.

## ⚠️ Important Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore` ✅
2. **Keep local and production separate** - Some values might differ:
   - `NODE_ENV` should be `development` locally, `production` in Vercel
   - `DATABASE_URL` might be different (local vs production database)
   - `FRONTEND_URL` should be `http://localhost:3000` locally
3. **JWT_SECRET should match** - Use the same secret in both places for tokens to work

## ✅ After Updating

1. Restart your local server:
   ```bash
   npm run dev
   ```
2. Test locally:
   ```bash
   curl http://localhost:3000/health
   ```

---

**Would you like me to update the .env file automatically, or do you prefer to do it manually?**
