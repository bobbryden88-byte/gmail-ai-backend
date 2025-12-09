-- Add Google OAuth columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "authProvider" TEXT;

-- Create unique index on googleId (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_key" ON "users"("googleId") WHERE "googleId" IS NOT NULL;
