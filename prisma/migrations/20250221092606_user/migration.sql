/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Made the column `full_name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_number` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ALTER COLUMN "full_name" SET NOT NULL,
ALTER COLUMN "phone_number" SET NOT NULL;
