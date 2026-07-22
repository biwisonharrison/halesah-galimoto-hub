export interface CatalogField {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "select" | "number";
  secret: boolean;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export interface CatalogProvider {
  key: string;
  label: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  icon: string;
  fields: CatalogField[];
  notes?: string;
}

export interface ProviderConfig {
  id: string;
  providerKey: string;
  providerLabel: string;
  icon?: string;
  label: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  environment: "SANDBOX" | "PRODUCTION";
  chainRole: "PRIMARY" | "BACKUP";
  priority: number;
  isActive: boolean;
  dailyLimit: number | null;
  monthlyLimit: number | null;
  lastTestedAt: string | null;
  lastTestStatus: string | null;
  lastTestResponse: string | null;
  lastTestError: string | null;
  lastTestResponseMs: number | null;
  createdAt: string;
  updatedAt: string;
  credentials: Record<string, string>;
}

export interface OtpSettingsData {
  otpEnabled: boolean;
  otpLength: number;
  otpFormat: "NUMERIC" | "ALPHANUMERIC";
  otpExpiryMinutes: number;
  maxVerifyAttempts: number;
  maxResendAttempts: number;
  resendCooldownSeconds: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  lockoutDurationMinutes: number;
  allowedCountries: string | null;
  blockedCountries: string | null;
  defaultCountryCode: string;
  channelPriority: string[];
  webhookDeliveryUrl: string | null;
  webhookVerificationUrl: string | null;
  webhookFailureUrl: string | null;
}

export const PURPOSES = ["LOGIN", "REGISTRATION", "PASSWORD_RESET", "CHANGE_PHONE", "CHANGE_EMAIL", "HIGH_RISK_LOGIN", "TWO_FACTOR"] as const;
export const CHANNELS = ["SMS", "WHATSAPP", "EMAIL"] as const;
export const ROLES = ["BUYER", "DEALER", "ADMIN", "DEVELOPER", "MANAGER", "SALES_AGENT", "MODERATOR"] as const;

export interface AuthPolicyData {
  requireOtpOnRegistration: boolean;
  requireOtpOnNewDevice: boolean;
  requireOtpOnChangePhone: boolean;
  requireOtpOnChangeEmail: boolean;
  forceOtpForAdmins: boolean;
  forceOtpForRoles: string[];
  trustedDevicesEnabled: boolean;
  trustedDeviceValidityDays: number;
  maxTrustedDevicesPerUser: number;
  forceOtpAfterDeviceExpiry: boolean;
  forceOtpAfterLogout: boolean;
  forceOtpAfterEmailChange: boolean;
  forceOtpAfterPhoneChange: boolean;
  forceOtpAfterSuspiciousLogin: boolean;
}
