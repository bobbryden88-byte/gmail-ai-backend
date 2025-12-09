# ✅ Run This SQL in Neon

## Copy and Paste This Exact SQL:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS googleId TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS authProvider TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_googleId_idx ON users(googleId) WHERE googleId IS NOT NULL;
```

## Steps:

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click on your **project**
3. Click **SQL Editor** (left sidebar)
4. **Delete everything** in the editor
5. **Paste the SQL above** (3 lines only)
6. Click **Run** or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)

## What This Does:

- Adds `googleId` column (for storing Google user ID)
- Adds `authProvider` column (for storing 'google' or 'email')
- Creates a unique index on `googleId` (so each Google account can only have one user)

## After Running:

1. You should see "Success" or "Query executed successfully"
2. Try logging in again through your extension
3. It should work now! ✅

---

**Important:** Only copy the 3 SQL lines above, nothing else!
