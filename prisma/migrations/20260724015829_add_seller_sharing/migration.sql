-- CreateEnum
CREATE TYPE "SellerSharingStatus" AS ENUM ('ENABLED', 'DISABLED', 'SUSPENDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SELLER_SHARING_ENABLED';
ALTER TYPE "NotificationType" ADD VALUE 'SELLER_SHARING_DISABLED';
ALTER TYPE "NotificationType" ADD VALUE 'SELLER_SHARING_SUSPENDED';

-- AlterTable
ALTER TABLE "SellerAccount" ADD COLUMN     "shareLinkListingClicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shareLinkPageViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shareLinkPhoneClicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shareLinkShareClicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shareLinkWhatsappClicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sharingStatus" "SellerSharingStatus" NOT NULL DEFAULT 'ENABLED',
ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "SellerSharingSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "allowCopyLink" BOOLEAN NOT NULL DEFAULT true,
    "allowWhatsappShare" BOOLEAN NOT NULL DEFAULT true,
    "allowFacebookShare" BOOLEAN NOT NULL DEFAULT true,
    "allowTwitterShare" BOOLEAN NOT NULL DEFAULT true,
    "allowTelegramShare" BOOLEAN NOT NULL DEFAULT true,
    "allowEmailShare" BOOLEAN NOT NULL DEFAULT true,
    "allowNativeShare" BOOLEAN NOT NULL DEFAULT true,
    "urlPrefix" TEXT NOT NULL DEFAULT 'seller',
    "slugFormat" TEXT NOT NULL DEFAULT 'BUSINESS_NAME',
    "fallbackUrl" TEXT NOT NULL DEFAULT '/',
    "disabledMessage" TEXT NOT NULL DEFAULT 'Inventory sharing is currently disabled.',
    "seoIndexing" BOOLEAN NOT NULL DEFAULT true,
    "seoSitemap" BOOLEAN NOT NULL DEFAULT true,
    "seoStructuredData" BOOLEAN NOT NULL DEFAULT true,
    "seoOpenGraph" BOOLEAN NOT NULL DEFAULT true,
    "seoTwitterCard" BOOLEAN NOT NULL DEFAULT true,
    "analyticsPageViews" BOOLEAN NOT NULL DEFAULT true,
    "analyticsListingClicks" BOOLEAN NOT NULL DEFAULT true,
    "analyticsPhoneClicks" BOOLEAN NOT NULL DEFAULT true,
    "analyticsWhatsappClicks" BOOLEAN NOT NULL DEFAULT true,
    "analyticsShareCounts" BOOLEAN NOT NULL DEFAULT true,
    "securityRequireVerification" BOOLEAN NOT NULL DEFAULT false,
    "securityHideLocation" BOOLEAN NOT NULL DEFAULT false,
    "securityHidePhone" BOOLEAN NOT NULL DEFAULT false,
    "securityHideWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "securityRateLimitEnabled" BOOLEAN NOT NULL DEFAULT false,
    "securityRateLimitPerMinute" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "SellerSharingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerAccount_slug_key" ON "SellerAccount"("slug");

-- CreateIndex
CREATE INDEX "SellerAccount_sharingStatus_idx" ON "SellerAccount"("sharingStatus");

-- AddForeignKey
ALTER TABLE "SellerSharingSettings" ADD CONSTRAINT "SellerSharingSettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

