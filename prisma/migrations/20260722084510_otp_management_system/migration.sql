-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'REGISTRATION', 'PASSWORD_RESET', 'CHANGE_PHONE', 'CHANGE_EMAIL', 'HIGH_RISK_LOGIN', 'TWO_FACTOR');

-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "OtpFormat" AS ENUM ('NUMERIC', 'ALPHANUMERIC');

-- CreateEnum
CREATE TYPE "OtpEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "OtpProviderRole" AS ENUM ('PRIMARY', 'BACKUP');

-- CreateEnum
CREATE TYPE "OtpDeliveryStatus" AS ENUM ('SENT', 'FAILED');

-- AlterTable
ALTER TABLE "OtpCode" ADD COLUMN     "channel" "OtpChannel" NOT NULL DEFAULT 'SMS',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "purpose" "OtpPurpose" NOT NULL DEFAULT 'LOGIN',
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OtpProviderConfig" (
    "id" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "label" TEXT NOT NULL,
    "environment" "OtpEnvironment" NOT NULL DEFAULT 'PRODUCTION',
    "chainRole" "OtpProviderRole" NOT NULL DEFAULT 'PRIMARY',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "credentialsEncrypted" TEXT NOT NULL,
    "dailyLimit" INTEGER,
    "monthlyLimit" INTEGER,
    "lastTestedAt" TIMESTAMP(3),
    "lastTestStatus" TEXT,
    "lastTestResponse" TEXT,
    "lastTestError" TEXT,
    "lastTestResponseMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "otpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "otpLength" INTEGER NOT NULL DEFAULT 6,
    "otpFormat" "OtpFormat" NOT NULL DEFAULT 'NUMERIC',
    "otpExpiryMinutes" INTEGER NOT NULL DEFAULT 10,
    "maxVerifyAttempts" INTEGER NOT NULL DEFAULT 5,
    "maxResendAttempts" INTEGER NOT NULL DEFAULT 3,
    "resendCooldownSeconds" INTEGER NOT NULL DEFAULT 60,
    "maxRequestsPerHour" INTEGER NOT NULL DEFAULT 5,
    "maxRequestsPerDay" INTEGER NOT NULL DEFAULT 20,
    "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 30,
    "allowedCountries" TEXT,
    "blockedCountries" TEXT,
    "defaultCountryCode" TEXT NOT NULL DEFAULT '+265',
    "channelPriority" JSONB NOT NULL DEFAULT '["SMS", "WHATSAPP", "EMAIL"]',
    "webhookDeliveryUrl" TEXT,
    "webhookVerificationUrl" TEXT,
    "webhookFailureUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "OtpSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpTemplate" (
    "id" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpDeliveryLog" (
    "id" TEXT NOT NULL,
    "otpCodeId" TEXT,
    "userId" TEXT,
    "purpose" "OtpPurpose" NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "destination" TEXT NOT NULL,
    "providerConfigId" TEXT,
    "providerKey" TEXT NOT NULL,
    "status" "OtpDeliveryStatus" NOT NULL,
    "providerResponse" TEXT,
    "errorMessage" TEXT,
    "responseTimeMs" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerificationLog" (
    "id" TEXT NOT NULL,
    "otpCodeId" TEXT,
    "userId" TEXT,
    "destination" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpLockout" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpLockout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpWebhookLog" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL,
    "payload" TEXT,
    "responseBody" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpProviderConfig_channel_idx" ON "OtpProviderConfig"("channel");

-- CreateIndex
CREATE INDEX "OtpProviderConfig_channel_chainRole_priority_idx" ON "OtpProviderConfig"("channel", "chainRole", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "OtpTemplate_purpose_channel_key" ON "OtpTemplate"("purpose", "channel");

-- CreateIndex
CREATE INDEX "OtpDeliveryLog_createdAt_idx" ON "OtpDeliveryLog"("createdAt");

-- CreateIndex
CREATE INDEX "OtpDeliveryLog_status_idx" ON "OtpDeliveryLog"("status");

-- CreateIndex
CREATE INDEX "OtpDeliveryLog_purpose_idx" ON "OtpDeliveryLog"("purpose");

-- CreateIndex
CREATE INDEX "OtpDeliveryLog_providerKey_idx" ON "OtpDeliveryLog"("providerKey");

-- CreateIndex
CREATE INDEX "OtpVerificationLog_createdAt_idx" ON "OtpVerificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "OtpVerificationLog_success_idx" ON "OtpVerificationLog"("success");

-- CreateIndex
CREATE INDEX "OtpLockout_identifier_idx" ON "OtpLockout"("identifier");

-- CreateIndex
CREATE INDEX "OtpLockout_blockedUntil_idx" ON "OtpLockout"("blockedUntil");

-- CreateIndex
CREATE INDEX "OtpAuditLog_createdAt_idx" ON "OtpAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "OtpWebhookLog_createdAt_idx" ON "OtpWebhookLog"("createdAt");

-- CreateIndex
CREATE INDEX "OtpWebhookLog_kind_idx" ON "OtpWebhookLog"("kind");

-- CreateIndex
CREATE INDEX "OtpCode_email_idx" ON "OtpCode"("email");

-- AddForeignKey
ALTER TABLE "OtpSettings" ADD CONSTRAINT "OtpSettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpDeliveryLog" ADD CONSTRAINT "OtpDeliveryLog_otpCodeId_fkey" FOREIGN KEY ("otpCodeId") REFERENCES "OtpCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpDeliveryLog" ADD CONSTRAINT "OtpDeliveryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpDeliveryLog" ADD CONSTRAINT "OtpDeliveryLog_providerConfigId_fkey" FOREIGN KEY ("providerConfigId") REFERENCES "OtpProviderConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpVerificationLog" ADD CONSTRAINT "OtpVerificationLog_otpCodeId_fkey" FOREIGN KEY ("otpCodeId") REFERENCES "OtpCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpVerificationLog" ADD CONSTRAINT "OtpVerificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpAuditLog" ADD CONSTRAINT "OtpAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
