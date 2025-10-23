-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dailyUsage" INTEGER NOT NULL DEFAULT 0,
    "monthlyUsage" INTEGER NOT NULL DEFAULT 0,
    "lastUsageDate" DATETIME,
    "lastResetDate" DATETIME,
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
