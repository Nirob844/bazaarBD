/*
  Warnings:

  - The values [DELIVERED,OPENED] on the enum `EmailStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACCOUNT_ACTIVITY,PROMOTIONAL] on the enum `EmailType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fromEmail` on the `EmailNotification` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `EmailNotification` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmailStatus_new" AS ENUM ('PENDING', 'SENT', 'FAILED');
ALTER TABLE "EmailNotification" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EmailNotification" ALTER COLUMN "status" TYPE "EmailStatus_new" USING ("status"::text::"EmailStatus_new");
ALTER TYPE "EmailStatus" RENAME TO "EmailStatus_old";
ALTER TYPE "EmailStatus_new" RENAME TO "EmailStatus";
DROP TYPE "EmailStatus_old";
ALTER TABLE "EmailNotification" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EmailType_new" AS ENUM ('WELCOME_EMAIL', 'ACCOUNT_CONFIRMATION', 'PASSWORD_RESET', 'ORDER_CONFIRMATION', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ACCOUNT_LOCKED', 'SECURITY_ALERT');
ALTER TABLE "EmailNotification" ALTER COLUMN "type" TYPE "EmailType_new" USING ("type"::text::"EmailType_new");
ALTER TYPE "EmailType" RENAME TO "EmailType_old";
ALTER TYPE "EmailType_new" RENAME TO "EmailType";
DROP TYPE "EmailType_old";
COMMIT;

-- DropIndex
DROP INDEX "EmailNotification_userId_type_status_sentAt_idx";

-- AlterTable
ALTER TABLE "EmailNotification" DROP COLUMN "fromEmail",
DROP COLUMN "openedAt",
ADD COLUMN     "messageId" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "EmailNotification_userId_idx" ON "EmailNotification"("userId");

-- CreateIndex
CREATE INDEX "EmailNotification_status_idx" ON "EmailNotification"("status");

-- CreateIndex
CREATE INDEX "EmailNotification_type_idx" ON "EmailNotification"("type");
