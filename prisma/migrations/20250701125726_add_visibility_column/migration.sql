/*
  Warnings:

  - Added the required column `visibility` to the `Paste` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'UNLISTED', 'ENCRYPTED');

-- AlterTable
ALTER TABLE "Paste" ADD COLUMN     "visibility" "Visibility" NOT NULL;
