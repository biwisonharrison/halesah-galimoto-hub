import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuthPolicySettings, User, Prisma } from "@prisma/client";
import { generateDeviceToken, hashDeviceToken, parseUserAgent, setTrustedDeviceCookie, clearTrustedDeviceCookie } from "@/lib/deviceFingerprint";

const SINGLETON_ID = "singleton";
const SUSPICIOUS_FAILED_ATTEMPTS_THRESHOLD = 3;
const SUSPICIOUS_WINDOW_HOURS = 1;

export async function getAuthPolicy(): Promise<AuthPolicySettings> {
  return prisma.authPolicySettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function updateAuthPolicy(data: Partial<Omit<AuthPolicySettings, "id" | "updatedAt">>, updatedById?: string) {
  return prisma.authPolicySettings.update({
    where: { id: SINGLETON_ID },
    data: { ...data, updatedById } as Prisma.AuthPolicySettingsUncheckedUpdateInput,
  });
}

export async function resetAuthPolicy() {
  await prisma.authPolicySettings.delete({ where: { id: SINGLETON_ID } }).catch(() => null);
  return getAuthPolicy();
}

export function getForcedRoles(policy: AuthPolicySettings): string[] {
  if (Array.isArray(policy.forceOtpForRoles)) return policy.forceOtpForRoles as string[];
  return [];
}

/** True if there have been too many failed login attempts for this phone recently. */
export async function isSuspiciousLogin(phone: string): Promise<boolean> {
  const since = new Date(Date.now() - SUSPICIOUS_WINDOW_HOURS * 60 * 60 * 1000);
  const failedCount = await prisma.loginAttempt.count({ where: { phone, success: false, createdAt: { gte: since } } });
  return failedCount >= SUSPICIOUS_FAILED_ATTEMPTS_THRESHOLD;
}

async function findValidTrustedDevice(userId: string, tokenHash: string) {
  return prisma.trustedDevice.findFirst({
    where: { userId, tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
  });
}

/**
 * Decides whether a login for this user needs OTP, given the visitor's
 * trusted-device cookie (if any). Returns the matching device record too, so
 * callers can bump its lastActiveAt on a trust-based login.
 */
export async function evaluateLoginOtpRequirement(
  user: User | null,
  deviceTokenRaw: string | null
): Promise<{ requiresOtp: boolean; trustedDevice: Awaited<ReturnType<typeof findValidTrustedDevice>> | null }> {
  if (!user) return { requiresOtp: true, trustedDevice: null };

  const policy = await getAuthPolicy();

  if (policy.forceOtpForAdmins && (user.role === "ADMIN" || user.role === "DEVELOPER")) {
    return { requiresOtp: true, trustedDevice: null };
  }
  if (getForcedRoles(policy).includes(user.role)) {
    return { requiresOtp: true, trustedDevice: null };
  }
  if (policy.forceOtpAfterSuspiciousLogin && (await isSuspiciousLogin(user.phone))) {
    return { requiresOtp: true, trustedDevice: null };
  }
  if (!policy.trustedDevicesEnabled || !deviceTokenRaw) {
    return { requiresOtp: policy.requireOtpOnNewDevice, trustedDevice: null };
  }

  const trustedDevice = await findValidTrustedDevice(user.id, hashDeviceToken(deviceTokenRaw));
  if (!trustedDevice) {
    return { requiresOtp: policy.requireOtpOnNewDevice, trustedDevice: null };
  }

  return { requiresOtp: false, trustedDevice };
}

export async function touchTrustedDevice(deviceId: string, ipAddress?: string | null) {
  await prisma.trustedDevice
    .update({ where: { id: deviceId }, data: { lastActiveAt: new Date(), ipAddress: ipAddress ?? undefined } })
    .catch(() => null);
}

/** Called after a successful OTP verification when the user opts to remember this device. */
export async function rememberDevice(userId: string, userAgent: string | null, ipAddress: string | null) {
  const policy = await getAuthPolicy();
  if (!policy.trustedDevicesEnabled) return;

  const existingCount = await prisma.trustedDevice.count({ where: { userId, revokedAt: null, expiresAt: { gt: new Date() } } });
  if (existingCount >= policy.maxTrustedDevicesPerUser) {
    const oldest = await prisma.trustedDevice.findFirst({
      where: { userId, revokedAt: null },
      orderBy: { lastActiveAt: "asc" },
    });
    if (oldest) await prisma.trustedDevice.update({ where: { id: oldest.id }, data: { revokedAt: new Date() } });
  }

  const { rawToken, tokenHash } = generateDeviceToken();
  const { label, browser, os } = parseUserAgent(userAgent);
  const expiresAt = new Date(Date.now() + policy.trustedDeviceValidityDays * 24 * 60 * 60 * 1000);

  await prisma.trustedDevice.create({
    data: { userId, tokenHash, label, browser, os, ipAddress: ipAddress ?? undefined, expiresAt },
  });
  await setTrustedDeviceCookie(rawToken, policy.trustedDeviceValidityDays);
}

/** Revokes the trusted device matching the current cookie (used on logout when configured). */
export async function revokeCurrentDevice(userId: string, deviceTokenRaw: string | null) {
  if (!deviceTokenRaw) return;
  await prisma.trustedDevice
    .updateMany({ where: { userId, tokenHash: hashDeviceToken(deviceTokenRaw) }, data: { revokedAt: new Date() } })
    .catch(() => null);
  await clearTrustedDeviceCookie();
}

/** Revokes every trusted device for a user — used after sensitive changes like phone/email updates. */
export async function revokeAllTrustedDevices(userId: string) {
  await prisma.trustedDevice.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}
