-- CreateTable
CREATE TABLE "summary_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summary_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "summary_logs_userId_createdAt_idx" ON "summary_logs"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "summary_logs" ADD CONSTRAINT "summary_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

