-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetPasswordExpiry" DATETIME;
ALTER TABLE "users" ADD COLUMN "resetPasswordToken" TEXT;
