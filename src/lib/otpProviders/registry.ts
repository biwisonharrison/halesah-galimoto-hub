import "server-only";
import type { OtpProviderDefinition, OtpChannelKey } from "./types";
import { SMS_PROVIDERS } from "./sms";
import { WHATSAPP_PROVIDERS } from "./whatsapp";
import { EMAIL_PROVIDERS } from "./email";

/**
 * The full provider registry. Adding a new provider means writing one
 * OtpProviderDefinition (fields + send()) in sms.ts/whatsapp.ts/email.ts and
 * adding it to the relevant array below — nothing else in the OTP system,
 * Developer Panel UI, or auth flow needs to change.
 */
export const ALL_PROVIDERS: OtpProviderDefinition[] = [...SMS_PROVIDERS, ...WHATSAPP_PROVIDERS, ...EMAIL_PROVIDERS];

const BY_KEY = new Map(ALL_PROVIDERS.map((p) => [p.key, p]));

export function getProviderDefinition(providerKey: string): OtpProviderDefinition | undefined {
  return BY_KEY.get(providerKey);
}

export function listProvidersByChannel(channel: OtpChannelKey): OtpProviderDefinition[] {
  return ALL_PROVIDERS.filter((p) => p.channel === channel);
}

export { SMS_PROVIDERS, WHATSAPP_PROVIDERS, EMAIL_PROVIDERS };
export type { OtpProviderDefinition, OtpProviderField, OtpChannelKey, OtpSendParams, OtpSendResult } from "./types";
