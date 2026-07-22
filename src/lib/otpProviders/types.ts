export type OtpProviderFieldType = "text" | "password" | "url" | "select" | "number";

export interface OtpProviderField {
  key: string;
  label: string;
  type: OtpProviderFieldType;
  secret: boolean;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export type OtpChannelKey = "SMS" | "WHATSAPP" | "EMAIL";

export interface OtpSendParams {
  to: string;
  message: string;
  subject?: string;
}

export interface OtpSendResult {
  success: boolean;
  providerResponse?: string;
  error?: string;
}

export interface OtpProviderDefinition {
  key: string;
  label: string;
  channel: OtpChannelKey;
  icon: string;
  fields: OtpProviderField[];
  notes?: string;
  send: (credentials: Record<string, string>, params: OtpSendParams) => Promise<OtpSendResult>;
}

export const COMMON_FIELDS = {
  environment: (): OtpProviderField => ({
    key: "environment",
    label: "Environment",
    type: "select",
    secret: false,
    required: true,
    options: [
      { value: "SANDBOX", label: "Sandbox" },
      { value: "PRODUCTION", label: "Production" },
    ],
    defaultValue: "PRODUCTION",
  }),
};
