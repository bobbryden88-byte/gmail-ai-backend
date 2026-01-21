-- Add trial tracking fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trialActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "planType" TEXT;

-- Rename subscriptionId to stripeSubscriptionId if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscriptionId') THEN
        ALTER TABLE "users" RENAME COLUMN "subscriptionId" TO "stripeSubscriptionId";
    END IF;
END $$;

-- Add unique constraint to stripeSubscriptionId if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_stripeSubscriptionId_key') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");
    END IF;
EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- Add unique constraint to stripeCustomerId if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_stripeCustomerId_key') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_stripeCustomerId_key" UNIQUE ("stripeCustomerId");
    END IF;
EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- Clean up duplicate googleid/authprovider columns if they exist (lowercase versions)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'googleid') THEN
        ALTER TABLE "users" DROP COLUMN IF EXISTS "googleid";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'authprovider') THEN
        ALTER TABLE "users" DROP COLUMN IF EXISTS "authprovider";
    END IF;
END $$;
