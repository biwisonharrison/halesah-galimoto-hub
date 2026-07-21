-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'DEALER', 'ADMIN', 'DEVELOPER', 'MANAGER', 'SALES_AGENT', 'MODERATOR');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'SOLD', 'HIDDEN', 'RESERVED', 'ARCHIVED', 'PENDING_DELETION', 'DELETED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SellerAccountStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'NONE');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('STANDARD_BANK', 'NATIONAL_BANK', 'MPAMBA', 'AIRTEL_MONEY');

-- CreateEnum
CREATE TYPE "SubscriptionPaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DeletionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REGISTRATION_APPROVED', 'REGISTRATION_REJECTED', 'LISTING_SUBMITTED', 'LISTING_APPROVED', 'LISTING_REJECTED', 'LISTING_CHANGES_REQUESTED', 'LISTING_HIDDEN', 'LISTING_REMOVED', 'DELETION_REQUESTED', 'DELETION_APPROVED', 'DELETION_REJECTED', 'PAYMENT_SUBMITTED', 'PAYMENT_CONFIRMED', 'PAYMENT_REJECTED', 'TRIAL_ENDING_7', 'TRIAL_ENDING_3', 'SUBSCRIPTION_EXPIRED', 'ADMIN_NEW_SELLER', 'ADMIN_NEW_LISTING', 'ADMIN_DELETION_REQUEST', 'ADMIN_PAYMENT_PROOF');

-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('PRIVATE', 'DEALER');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "Drivetrain" AS ENUM ('TWO_WD', 'FOUR_WD', 'AWD');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'PICKUP', 'VAN', 'MINIBUS', 'WAGON', 'COUPE', 'TRUCK', 'MOTORCYCLE');

-- CreateEnum
CREATE TYPE "SaleCondition" AS ENUM ('NEW', 'FOREIGN_USED', 'LOCALLY_USED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED', 'ACTIONED');

-- CreateEnum
CREATE TYPE "PhotoCategory" AS ENUM ('OUTER_VIEW', 'SEATS', 'DASHBOARD', 'SUNROOF', 'INSTRUMENT_CLUSTER', 'STEERING_WHEEL', 'BOOTSPACE', 'GEAR', 'HEAD_LIGHT_TAIL_LIGHTS', 'DOORS_AND_CONTROLS', 'AC', 'AIRBAGS', 'CHARGING_PORTS', 'STORAGE', 'EXTERIOR_CLOSEUPS', 'OTHER');

-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('DATABASE', 'MEDIA', 'CONFIG');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "phoneVerifiedAt" TIMESTAMP(3),
    "idVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" TEXT,
    "description" TEXT,
    "district" TEXT,
    "status" "SellerAccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "rejectionReason" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "trial7DayNoticeSentAt" TIMESTAMP(3),
    "trial3DayNoticeSentAt" TIMESTAMP(3),
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
    "subscriptionExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMwk" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "label" TEXT NOT NULL,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "phoneNumber" TEXT,
    "instructions" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" TEXT NOT NULL,
    "sellerAccountId" TEXT NOT NULL,
    "planId" TEXT,
    "paymentMethodId" TEXT,
    "amountMwk" INTEGER NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "status" "SubscriptionPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "confirmedById" TEXT,

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingDeletionRequest" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "reason" TEXT,
    "previousStatus" "ListingStatus" NOT NULL,
    "status" "DeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "ListingDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "originCountry" TEXT,
    "logoUrl" TEXT,
    "history" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER,
    "bodyType" "BodyType" NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "drivetrain" "Drivetrain" NOT NULL,
    "engineCc" INTEGER,
    "seating" INTEGER,
    "description" TEXT,
    "strengths" TEXT,
    "faults" TEXT,
    "partAvailabilityRating" INTEGER,
    "isClassic" BOOLEAN NOT NULL DEFAULT false,
    "baseValueMwk" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelPhoto" (
    "id" TEXT NOT NULL,
    "carModelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "submittedById" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "sellerType" "SellerType" NOT NULL DEFAULT 'PRIVATE',
    "carModelId" TEXT,
    "title" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "priceMwk" INTEGER NOT NULL,
    "mileageKm" INTEGER NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "fuelType" TEXT,
    "bodyType" TEXT,
    "engineCc" INTEGER,
    "seating" INTEGER,
    "drivetrain" "Drivetrain",
    "saleCondition" "SaleCondition" NOT NULL DEFAULT 'FOREIGN_USED',
    "condition" TEXT NOT NULL,
    "description" TEXT,
    "districtId" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewNotes" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),
    "boosted" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPhoto" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "PhotoCategory" NOT NULL DEFAULT 'OTHER',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "notifyBySms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "siteName" TEXT NOT NULL DEFAULT 'Halesah Galimoto Hub',
    "tagline" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#137d54',
    "secondaryColor" TEXT NOT NULL DEFAULT '#0D2A4A',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "whatsappNumber" TEXT,
    "address" TEXT,
    "companyName" TEXT,
    "registrationNumber" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MWK',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Blantyre',
    "taxRatePercent" DOUBLE PRECISION,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "smtpFromEmail" TEXT,
    "notifyEmailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notifyWhatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettingsHistory" (
    "id" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteSettingsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "subtitle" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL,
    "type" "BackupType" NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'PENDING',
    "filename" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "errorMessage" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "OtpCode_phone_idx" ON "OtpCode"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "SellerAccount_userId_key" ON "SellerAccount"("userId");

-- CreateIndex
CREATE INDEX "SellerAccount_status_idx" ON "SellerAccount"("status");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_status_idx" ON "SubscriptionPayment"("status");

-- CreateIndex
CREATE INDEX "ListingDeletionRequest_status_idx" ON "ListingDeletionRequest"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "CarModel_isClassic_idx" ON "CarModel"("isClassic");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_brandId_slug_key" ON "CarModel"("brandId", "slug");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_brandName_modelName_idx" ON "Listing"("brandName", "modelName");

-- CreateIndex
CREATE INDEX "Listing_districtId_idx" ON "Listing"("districtId");

-- CreateIndex
CREATE INDEX "Listing_saleCondition_idx" ON "Listing"("saleCondition");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_sellerId_title_key" ON "Listing"("sellerId", "title");

-- CreateIndex
CREATE INDEX "ListingPhoto_listingId_category_idx" ON "ListingPhoto"("listingId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_listingId_buyerId_key" ON "Conversation"("listingId", "buyerId");

-- CreateIndex
CREATE INDEX "LoginAttempt_phone_idx" ON "LoginAttempt"("phone");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "SiteSettingsHistory_createdAt_idx" ON "SiteSettingsHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_key_key" ON "HomepageSection"("key");

-- CreateIndex
CREATE INDEX "HomepageSection_sortOrder_idx" ON "HomepageSection"("sortOrder");

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "Backup_createdAt_idx" ON "Backup"("createdAt");

-- AddForeignKey
ALTER TABLE "SellerAccount" ADD CONSTRAINT "SellerAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_sellerAccountId_fkey" FOREIGN KEY ("sellerAccountId") REFERENCES "SellerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingDeletionRequest" ADD CONSTRAINT "ListingDeletionRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingDeletionRequest" ADD CONSTRAINT "ListingDeletionRequest_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingDeletionRequest" ADD CONSTRAINT "ListingDeletionRequest_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarModel" ADD CONSTRAINT "CarModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelPhoto" ADD CONSTRAINT "ModelPhoto_carModelId_fkey" FOREIGN KEY ("carModelId") REFERENCES "CarModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelPhoto" ADD CONSTRAINT "ModelPhoto_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_carModelId_fkey" FOREIGN KEY ("carModelId") REFERENCES "CarModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPhoto" ADD CONSTRAINT "ListingPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettingsHistory" ADD CONSTRAINT "SiteSettingsHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchLog" ADD CONSTRAINT "SearchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backup" ADD CONSTRAINT "Backup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
