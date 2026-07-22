-- CreateTable
CREATE TABLE "TrustedDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "ipAddress" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthPolicySettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "requireOtpOnRegistration" BOOLEAN NOT NULL DEFAULT true,
    "requireOtpOnNewDevice" BOOLEAN NOT NULL DEFAULT true,
    "requireOtpOnChangePhone" BOOLEAN NOT NULL DEFAULT true,
    "requireOtpOnChangeEmail" BOOLEAN NOT NULL DEFAULT true,
    "forceOtpForAdmins" BOOLEAN NOT NULL DEFAULT true,
    "forceOtpForRoles" JSONB NOT NULL DEFAULT '[]',
    "trustedDevicesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "trustedDeviceValidityDays" INTEGER NOT NULL DEFAULT 30,
    "maxTrustedDevicesPerUser" INTEGER NOT NULL DEFAULT 5,
    "forceOtpAfterDeviceExpiry" BOOLEAN NOT NULL DEFAULT true,
    "forceOtpAfterLogout" BOOLEAN NOT NULL DEFAULT false,
    "forceOtpAfterEmailChange" BOOLEAN NOT NULL DEFAULT true,
    "forceOtpAfterPhoneChange" BOOLEAN NOT NULL DEFAULT true,
    "forceOtpAfterSuspiciousLogin" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "AuthPolicySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrustedDevice_tokenHash_key" ON "TrustedDevice"("tokenHash");

-- CreateIndex
CREATE INDEX "TrustedDevice_userId_idx" ON "TrustedDevice"("userId");

-- AddForeignKey
ALTER TABLE "TrustedDevice" ADD CONSTRAINT "TrustedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthPolicySettings" ADD CONSTRAINT "AuthPolicySettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
