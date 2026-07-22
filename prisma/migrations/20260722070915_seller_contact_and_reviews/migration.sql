/*
  Warnings:

  - Made the column `comment` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_subjectId_fkey";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "displayAnonymously" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listingId" TEXT,
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "title" TEXT,
ALTER COLUMN "subjectId" DROP NOT NULL,
ALTER COLUMN "comment" SET NOT NULL;

-- AlterTable
ALTER TABLE "SellerAccount" ADD COLUMN     "callPhoneNumber" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_subjectId_idx" ON "Review"("subjectId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
