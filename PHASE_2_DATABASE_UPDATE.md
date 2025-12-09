# Phase 2: Database Schema Update

## ✅ Schema Updated

Added to `prisma/schema.prisma`:
- `googleId String? @unique` - Google user ID (sub claim from token)
- `authProvider String?` - 'email' or 'google'

## 🔧 Migration Options

### Option 1: If Using PostgreSQL

Run the migration:
```bash
cd /Users/bobbryden/gmail-ai-backend
npx prisma migrate dev --name add_google_oauth
```

Or manually run the SQL:
```sql
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "authProvider" TEXT;

CREATE INDEX IF NOT EXISTS "users_googleId_idx" ON "users"("googleId");
```

### Option 2: If Using SQLite (Local Dev)

Update `prisma/schema.prisma` datasource to:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma migrate dev --name add_google_oauth
```

Or manually run SQL:
```sql
ALTER TABLE "users" ADD COLUMN "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN "authProvider" TEXT;
CREATE UNIQUE INDEX "users_googleId_unique" ON "users"("googleId");
```

## ✅ After Migration

Run:
```bash
npx prisma generate
```

This updates the Prisma client with the new fields.

## 🎯 Next: Phase 3

Once the migration is complete, we'll proceed to:
- Install `google-auth-library`
- Create Google token verification service
- Update `/api/auth/google` endpoint
