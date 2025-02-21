/*
  Warnings:

  - You are about to drop the column `full_name` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "full_name",
DROP COLUMN "phone_number";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "phone_number" TEXT;
