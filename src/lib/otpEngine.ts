import "server-only";
import { prisma } from "@/lib/prisma";
import type { OtpPurpose, OtpChannel, OtpSettings, OtpFormat } from "@prisma/client";
import { getOtpSettings, getChannelPriority } from "@/lib/otpSettings";
import { decryptCredentials } from "@/lib/otpEncryption";
import { getProviderDefinition } from "@/lib/otpProviders/registry";
import { getTemplate, renderTemplate } from "@/lib/otpTemplates";
import { fireOtpWebhook } from "@/lib/otpWebhooks";

export interface OtpRequestInput {
  purpose: OtpPurpose;
  phone?: string | null;
  email?: string | null;
  userName?: string | null;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface OtpVerifyInput {
  purpose: OtpPurpose;
  phone?: string | null;
  email?: string | null;
  code: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function generateCode(length: number, format: OtpFormat): string {
  if (format === "ALPHANUMERIC") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  const max = 10 ** length;
  return Math.floor(Math.random() * max)
    .toString()
    .padStart(length, "0");
}

function identifierWhere(phone?: string | null, email?: string | null): { phone: string } | { email: string } {
  if (phone) return { phone };
  if (email) return { email };
  throw new Error("An identifier (phone or email) is required.");
}

function extractDialCode(phone: string): string | null {
  const match = phone.match(/^\+\d+/);
  return match ? match[0] : null;
}

function isCountryAllowed(phone: string, settings: OtpSettings): boolean {
  const dial = extractDialCode(phone);
  if (!dial) return true;
  const blocked = (settings.blockedCountries || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (blocked.some((code) => dial.startsWith(code))) return false;
  const allowed = (settings.allowedCountries || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allowed.length > 0 && !allowed.some((code) => dial.startsWith(code))) return false;
  return true;
}

async function getActiveLockout(identifier: string) {
  return prisma.otpLockout.findFirst({
    where: { identifier, blockedUntil: { gt: new Date() } },
    orderBy: { blockedUntil: "desc" },
  });
}

async function createLockout(identifier: string, scope: string, reason: string, minutes: number) {
  await prisma.otpLockout.create({
    data: { identifier, scope, reason, blockedUntil: new Date(Date.now() + minutes * 60 * 1000) },
  });
}

async function countCodesSince(where: { phone: string } | { email: string }, purpose: OtpPurpose, since?: Date) {
  return prisma.otpCode.count({ where: { ...where, purpose, createdAt: since ? { gte: since } : undefined } });
}

async function getActiveProviderChain(channel: OtpChannel) {
  const configs = await prisma.otpProviderConfig.findMany({ where: { channel, isActive: true } });
  return configs.sort((a, b) => {
    if (a.chainRole !== b.chainRole) return a.chainRole === "PRIMARY" ? -1 : 1;
    return a.priority - b.priority;
  });
}

function eligibleChannels(settings: OtpSettings, phone?: string | null, email?: string | null): OtpChannel[] {
  const priority = getChannelPriority(settings) as OtpChannel[];
  return priority.filter((ch) => (ch === "EMAIL" ? Boolean(email) : Boolean(phone)));
}

/**
 * Requests a new OTP: enforces enable/disable, country restrictions, rate
 * limits, and lockouts, then attempts delivery across channels in priority
 * order, and across primary/backup providers within each channel, until one
 * send succeeds. Every attempt (success or failure) is logged.
 */
export async function requestOtp(input: OtpRequestInput): Promise<{ ok: true; channel: OtpChannel } | { ok: false; error: string }> {
  const settings = await getOtpSettings();
  if (!settings.otpEnabled) return { ok: false, error: "OTP verification is currently disabled." };

  const identifier = input.phone || input.email;
  if (!identifier) return { ok: false, error: "A phone number or email address is required." };
  const idWhere = identifierWhere(input.phone, input.email);

  if (input.phone && !isCountryAllowed(input.phone, settings)) {
    return { ok: false, error: "OTP delivery is not available for this country." };
  }

  if (await getActiveLockout(identifier)) {
    return { ok: false, error: "Too many attempts. Please try again later." };
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [hourCount, dayCount] = await Promise.all([
    countCodesSince(idWhere, input.purpose, hourAgo),
    countCodesSince(idWhere, input.purpose, dayAgo),
  ]);
  if (hourCount >= settings.maxRequestsPerHour) {
    await createLockout(identifier, "REQUEST", "max_requests_per_hour", settings.lockoutDurationMinutes);
    return { ok: false, error: "Too many requests. Please try again later." };
  }
  if (dayCount >= settings.maxRequestsPerDay) {
    await createLockout(identifier, "REQUEST", "max_requests_per_day", settings.lockoutDurationMinutes);
    return { ok: false, error: "Daily request limit reached. Please try again tomorrow." };
  }

  const lastCode = await prisma.otpCode.findFirst({ where: { ...idWhere, purpose: input.purpose }, orderBy: { createdAt: "desc" } });
  if (lastCode && Date.now() - lastCode.createdAt.getTime() < settings.resendCooldownSeconds * 1000) {
    const waitSeconds = Math.ceil((settings.resendCooldownSeconds * 1000 - (Date.now() - lastCode.createdAt.getTime())) / 1000);
    return { ok: false, error: `Please wait ${waitSeconds}s before requesting another code.` };
  }

  const lastSuccess = await prisma.otpVerificationLog.findFirst({
    where: { destination: identifier, purpose: input.purpose, success: true },
    orderBy: { createdAt: "desc" },
  });
  const resendCount = await countCodesSince(idWhere, input.purpose, lastSuccess?.createdAt);
  if (resendCount >= settings.maxResendAttempts) {
    await createLockout(identifier, "REQUEST", "max_resend_attempts", settings.lockoutDurationMinutes);
    return { ok: false, error: "Too many code requests. Please try again later." };
  }

  const channels = eligibleChannels(settings, input.phone, input.email);
  if (channels.length === 0) {
    return { ok: false, error: "No delivery channel is available for the contact info provided." };
  }

  const code = generateCode(settings.otpLength, settings.otpFormat);
  const expiresAt = new Date(Date.now() + settings.otpExpiryMinutes * 60 * 1000);

  for (const channel of channels) {
    const destination = channel === "EMAIL" ? input.email! : input.phone!;
    const chain = await getActiveProviderChain(channel);
    if (chain.length === 0) continue;

    const template = await getTemplate(input.purpose, channel);
    const rendered = await renderTemplate(template, { otp: code, userName: input.userName, expiryMinutes: settings.otpExpiryMinutes });

    for (const config of chain) {
      const adapter = getProviderDefinition(config.providerKey);
      if (!adapter) continue;

      const start = Date.now();
      let result;
      try {
        const creds = decryptCredentials(config.credentialsEncrypted);
        result = await adapter.send(creds, { to: destination, message: rendered.body, subject: rendered.subject });
      } catch (err) {
        result = { success: false, error: err instanceof Error ? err.message : "Provider send failed" };
      }
      const responseTimeMs = Date.now() - start;

      if (result.success) {
        const otpCode = await prisma.otpCode.create({
          data: {
            phone: channel === "EMAIL" ? null : destination,
            email: channel === "EMAIL" ? destination : null,
            code,
            purpose: input.purpose,
            channel,
            expiresAt,
          },
        });
        await prisma.otpDeliveryLog.create({
          data: {
            otpCodeId: otpCode.id,
            userId: input.userId ?? undefined,
            purpose: input.purpose,
            channel,
            destination,
            providerConfigId: config.id,
            providerKey: config.providerKey,
            status: "SENT",
            providerResponse: result.providerResponse,
            responseTimeMs,
            ipAddress: input.ipAddress ?? undefined,
            userAgent: input.userAgent ?? undefined,
          },
        });
        await fireOtpWebhook("DELIVERY", settings.webhookDeliveryUrl, { destination, purpose: input.purpose, channel, providerKey: config.providerKey });
        return { ok: true, channel };
      }

      await prisma.otpDeliveryLog.create({
        data: {
          userId: input.userId ?? undefined,
          purpose: input.purpose,
          channel,
          destination,
          providerConfigId: config.id,
          providerKey: config.providerKey,
          status: "FAILED",
          errorMessage: result.error,
          responseTimeMs,
          ipAddress: input.ipAddress ?? undefined,
          userAgent: input.userAgent ?? undefined,
        },
      });
    }
  }

  // Zero-config fallback: if no provider has ever been configured anywhere in the
  // system (fresh install / local dev), log the code to the server console instead
  // of hard-failing. As soon as one real provider is activated for any channel,
  // this fallback stops being used.
  const anyProviderConfigured = (await prisma.otpProviderConfig.count()) === 0;
  if (anyProviderConfigured) {
    const destination = identifier;
    const otpCode = await prisma.otpCode.create({
      data: {
        phone: input.phone ? input.phone : null,
        email: input.email ? input.email : null,
        code,
        purpose: input.purpose,
        channel: input.phone ? "SMS" : "EMAIL",
        expiresAt,
      },
    });
    console.log(`[OTP] ${destination} -> ${code} (valid ${settings.otpExpiryMinutes} min) — no provider configured, see Developer > OTP Configuration`);
    await prisma.otpDeliveryLog.create({
      data: {
        otpCodeId: otpCode.id,
        userId: input.userId ?? undefined,
        purpose: input.purpose,
        channel: otpCode.channel,
        destination,
        providerKey: "CONSOLE",
        status: "SENT",
        providerResponse: "Logged to server console (no provider configured yet)",
        ipAddress: input.ipAddress ?? undefined,
        userAgent: input.userAgent ?? undefined,
      },
    });
    return { ok: true, channel: otpCode.channel };
  }

  await fireOtpWebhook("FAILURE", settings.webhookFailureUrl, { destination: identifier, purpose: input.purpose });
  return { ok: false, error: "We couldn't send a verification code right now. Please try again shortly." };
}

/** Verifies a submitted code: enforces lockouts and max-attempt limits, and logs every attempt. */
export async function verifyOtp(input: OtpVerifyInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const settings = await getOtpSettings();
  const identifier = input.phone || input.email;
  if (!identifier) return { ok: false, error: "A phone number or email address is required." };
  const idWhere = identifierWhere(input.phone, input.email);

  async function logVerification(success: boolean, reason?: string, otpCodeId?: string) {
    await prisma.otpVerificationLog
      .create({
        data: {
          otpCodeId,
          userId: input.userId ?? undefined,
          destination: identifier!,
          purpose: input.purpose,
          success,
          reason,
          ipAddress: input.ipAddress ?? undefined,
          userAgent: input.userAgent ?? undefined,
        },
      })
      .catch(() => null);
  }

  if (await getActiveLockout(identifier)) {
    await logVerification(false, "locked_out");
    return { ok: false, error: "Too many attempts. Please try again later." };
  }

  const candidate = await prisma.otpCode.findFirst({
    where: { ...idWhere, purpose: input.purpose, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!candidate) {
    await logVerification(false, "no_active_code");
    return { ok: false, error: "That code is invalid or has expired." };
  }

  const failedAttempts = await prisma.otpVerificationLog.count({ where: { otpCodeId: candidate.id, success: false } });
  if (failedAttempts >= settings.maxVerifyAttempts) {
    await prisma.otpCode.update({ where: { id: candidate.id }, data: { consumed: true } });
    await createLockout(identifier, "VERIFY", "max_verify_attempts", settings.lockoutDurationMinutes);
    await logVerification(false, "max_attempts_exceeded", candidate.id);
    return { ok: false, error: "Too many incorrect attempts. This code has been locked — request a new one shortly." };
  }

  if (candidate.code !== input.code) {
    await logVerification(false, "incorrect_code", candidate.id);
    return { ok: false, error: "That code is invalid or has expired." };
  }

  await prisma.otpCode.update({ where: { id: candidate.id }, data: { consumed: true } });
  await logVerification(true, undefined, candidate.id);
  await fireOtpWebhook("VERIFICATION", settings.webhookVerificationUrl, { destination: identifier, purpose: input.purpose });
  return { ok: true };
}
