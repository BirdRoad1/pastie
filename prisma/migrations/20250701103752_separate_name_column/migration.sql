/*
  Warnings:

  - The primary key for the `Paste` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Paste` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `name` to the `Paste` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Paste" DROP CONSTRAINT "Paste_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Paste_pkey" PRIMARY KEY ("id");
