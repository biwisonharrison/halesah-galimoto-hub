import "server-only";
import type { OtpProviderConfig } from "@prisma/client";
import { decryptCredentials, maskSecret } from "@/lib/otpEncryption";
import { getProviderDefinition } from "@/lib/otpProviders/registry";

/** Returns a provider config safe to send to the browser: secret fields masked, non-secret fields shown plainly. */
export function toSafeProviderConfig(config: OtpProviderConfig) {
  const definition = getProviderDefinition(config.providerKey);
  let credentials: Record<string, string> = {};
  try {
    credentials = decryptCredentials(config.credentialsEncrypted);
  } catch {
    credentials = {};
  }

  const safeCredentials: Record<string, string> = {};
  for (const field of definition?.fields ?? []) {
    const value = credentials[field.key];
    if (!value) continue;
    safeCredentials[field.key] = field.secret ? maskSecret(value) : value;
  }

  return {
    id: config.id,
    providerKey: config.providerKey,
    label: config.label,
    channel: config.channel,
    environment: config.environment,
    chainRole: config.chainRole,
    priority: config.priority,
    isActive: config.isActive,
    dailyLimit: config.dailyLimit,
    monthlyLimit: config.monthlyLimit,
    lastTestedAt: config.lastTestedAt,
    lastTestStatus: config.lastTestStatus,
    lastTestResponse: config.lastTestResponse,
    lastTestError: config.lastTestError,
    lastTestResponseMs: config.lastTestResponseMs,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
    credentials: safeCredentials,
    providerLabel: definition?.label ?? config.providerKey,
    icon: definition?.icon,
  };
}
