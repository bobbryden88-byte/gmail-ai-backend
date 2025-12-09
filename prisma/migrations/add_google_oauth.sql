-- Add Google OAuth fields to users table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "authProvider" TEXT;

-- Create index on googleId for faster lookups
CREATE INDEX IF NOT EXISTS "users_googleId_idx" ON "users"("googleId");
