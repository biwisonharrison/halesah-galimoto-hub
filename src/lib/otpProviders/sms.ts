import "server-only";
import type { OtpProviderDefinition } from "./types";
import { postJson, postForm, basicAuthHeader } from "./httpHelpers";

const TWILIO_SMS: OtpProviderDefinition = {
  key: "TWILIO_SMS",
  label: "Twilio",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "accountSid", label: "Account SID", type: "text", secret: false, required: true },
    { key: "authToken", label: "Auth Token", type: "password", secret: true, required: true },
    { key: "senderNumber", label: "Sender Number", type: "text", secret: false, required: false, helpText: "Your Twilio phone number, e.g. +14155551234" },
    { key: "messagingServiceSid", label: "Messaging Service SID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`;
    const body: Record<string, string> = { To: to, Body: message };
    if (creds.messagingServiceSid) body.MessagingServiceSid = creds.messagingServiceSid;
    else if (creds.senderNumber) body.From = creds.senderNumber;
    return postForm(url, body, { Authorization: basicAuthHeader(creds.accountSid, creds.authToken) });
  },
};

const AFRICAS_TALKING_SMS: OtpProviderDefinition = {
  key: "AFRICASTALKING_SMS",
  label: "Africa's Talking",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "username", label: "Username", type: "text", secret: false, required: true, helpText: "Use \"sandbox\" while testing with a trial account." },
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderId", label: "Sender ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    const baseUrl =
      creds.username === "sandbox"
        ? "https://api.sandbox.africastalking.com/version1/messaging"
        : "https://api.africastalking.com/version1/messaging";
    const body: Record<string, string> = { username: creds.username, to, message };
    if (creds.senderId) body.from = creds.senderId;
    return postForm(baseUrl, body, { apiKey: creds.apiKey, Accept: "application/json" });
  },
};

const VONAGE_SMS: OtpProviderDefinition = {
  key: "VONAGE_SMS",
  label: "Vonage (Nexmo)",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "apiKey", label: "API Key", type: "text", secret: false, required: true },
    { key: "apiSecret", label: "API Secret", type: "password", secret: true, required: true },
    { key: "senderId", label: "Sender ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    return postJson("https://rest.nexmo.com/sms/json", {
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
      to,
      from: creds.senderId || "Verify",
      text: message,
    });
  },
};

const MESSAGEBIRD_SMS: OtpProviderDefinition = {
  key: "MESSAGEBIRD_SMS",
  label: "MessageBird",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderId", label: "Sender ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    return postJson(
      "https://rest.messagebird.com/messages",
      { recipients: [to], originator: creds.senderId || "Verify", body: message },
      { Authorization: `AccessKey ${creds.apiKey}` }
    );
  },
};

const PLIVO_SMS: OtpProviderDefinition = {
  key: "PLIVO_SMS",
  label: "Plivo",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "authId", label: "Auth ID", type: "text", secret: false, required: true },
    { key: "authToken", label: "Auth Token", type: "password", secret: true, required: true },
    { key: "senderNumber", label: "Sender Number", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message }) {
    return postJson(
      `https://api.plivo.com/v1/Account/${creds.authId}/Message/`,
      { src: creds.senderNumber, dst: to, text: message },
      { Authorization: basicAuthHeader(creds.authId, creds.authToken) }
    );
  },
};

const INFOBIP_SMS: OtpProviderDefinition = {
  key: "INFOBIP_SMS",
  label: "Infobip",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "apiUrl", label: "API URL", type: "url", secret: false, required: true, helpText: "Your account-specific base URL, e.g. https://xxxxx.api.infobip.com" },
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderId", label: "Sender ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    return postJson(
      `${creds.apiUrl.replace(/\/$/, "")}/sms/2/text/advanced`,
      { messages: [{ destinations: [{ to }], from: creds.senderId || undefined, text: message }] },
      { Authorization: `App ${creds.apiKey}` }
    );
  },
};

const TELNYX_SMS: OtpProviderDefinition = {
  key: "TELNYX_SMS",
  label: "Telnyx",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderNumber", label: "Sender Number", type: "text", secret: false, required: false },
    { key: "messagingServiceSid", label: "Messaging Profile ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    const body: Record<string, unknown> = { to, text: message };
    if (creds.messagingServiceSid) body.messaging_profile_id = creds.messagingServiceSid;
    else body.from = creds.senderNumber;
    return postJson("https://api.telnyx.com/v2/messages", body, { Authorization: `Bearer ${creds.apiKey}` });
  },
};

const SINCH_SMS: OtpProviderDefinition = {
  key: "SINCH_SMS",
  label: "Sinch",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "projectId", label: "Service Plan ID", type: "text", secret: false, required: true },
    { key: "authToken", label: "API Token", type: "password", secret: true, required: true },
    { key: "senderId", label: "Sender ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    return postJson(
      `https://sms.api.sinch.com/xms/v1/${creds.projectId}/batches`,
      { from: creds.senderId || undefined, to: [to], body: message },
      { Authorization: `Bearer ${creds.authToken}` }
    );
  },
};

const CLICKSEND_SMS: OtpProviderDefinition = {
  key: "CLICKSEND_SMS",
  label: "ClickSend",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "username", label: "Username", type: "text", secret: false, required: true },
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderId", label: "Sender ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    return postJson(
      "https://rest.clicksend.com/v3/sms/send",
      { messages: [{ source: "sdk", body: message, to, from: creds.senderId || undefined }] },
      { Authorization: basicAuthHeader(creds.username, creds.apiKey) }
    );
  },
};

const SMSTO_SMS: OtpProviderDefinition = {
  key: "SMSTO_SMS",
  label: "SMS.to",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderId", label: "Sender ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    return postJson(
      "https://api.sms.to/sms/send",
      { to, message, sender_id: creds.senderId || undefined },
      { Authorization: `Bearer ${creds.apiKey}` }
    );
  },
};

const TEXTBELT_SMS: OtpProviderDefinition = {
  key: "TEXTBELT_SMS",
  label: "Textbelt",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true, helpText: "Use \"textbelt_test\" for free sandbox testing." },
    { key: "apiUrl", label: "API URL", type: "url", secret: false, required: false, defaultValue: "https://textbelt.com/text", helpText: "Override if you're self-hosting Textbelt." },
  ],
  async send(creds, { to, message }) {
    return postForm(creds.apiUrl || "https://textbelt.com/text", { phone: to, message, key: creds.apiKey });
  },
};

const AWS_SNS: OtpProviderDefinition = {
  key: "AWS_SNS",
  label: "AWS SNS",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "clientId", label: "Access Key ID", type: "text", secret: false, required: true },
    { key: "clientSecret", label: "Secret Access Key", type: "password", secret: true, required: true },
    { key: "region", label: "Region", type: "text", secret: false, required: true, placeholder: "eu-west-1" },
    { key: "senderId", label: "Sender ID", type: "text", secret: false, required: false },
  ],
  async send(creds, { to, message }) {
    try {
      const { SNSClient, PublishCommand } = await import("@aws-sdk/client-sns");
      const client = new SNSClient({
        region: creds.region,
        credentials: { accessKeyId: creds.clientId, secretAccessKey: creds.clientSecret },
      });
      const attrs: Record<string, { DataType: string; StringValue: string }> = {};
      if (creds.senderId) attrs.SenderID = { DataType: "String", StringValue: creds.senderId };
      const res = await client.send(new PublishCommand({ PhoneNumber: to, Message: message, MessageAttributes: attrs }));
      return { success: true, providerResponse: res.MessageId ?? "sent" };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "AWS SNS error" };
    }
  },
};

const AZURE_SMS: OtpProviderDefinition = {
  key: "AZURE_SMS",
  label: "Azure Communication Services",
  channel: "SMS",
  icon: "📱",
  fields: [
    { key: "apiUrl", label: "Connection String", type: "password", secret: true, required: true, helpText: "The full ACS connection string from the Azure portal." },
    { key: "senderNumber", label: "Sender Number", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message }) {
    try {
      const { SmsClient } = await import("@azure/communication-sms");
      const client = new SmsClient(creds.apiUrl);
      const [result] = await client.send({ from: creds.senderNumber, to: [to], message });
      if (!result.successful) return { success: false, error: result.errorMessage ?? "Azure SMS send failed" };
      return { success: true, providerResponse: result.messageId ?? "sent" };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Azure Communication Services error" };
    }
  },
};

const FIREBASE_PHONE_AUTH: OtpProviderDefinition = {
  key: "FIREBASE_PHONE_AUTH",
  label: "Google Firebase (Phone Auth)",
  channel: "SMS",
  icon: "📱",
  notes:
    "Firebase Phone Auth sends and verifies OTPs from the CLIENT SDK (browser/app), not from a server. There is no server-side API to trigger a Firebase-sent SMS. This entry is provided so it appears in the provider list, but Send will fail with an explanatory error — use a real server-callable provider above, or integrate the Firebase Client SDK directly in the login page instead of this backend flow.",
  fields: [
    { key: "projectId", label: "Project ID", type: "text", secret: false, required: true },
    { key: "clientEmail", label: "Client Email (service account)", type: "text", secret: false, required: false },
    { key: "clientSecret", label: "Private Key (service account)", type: "password", secret: true, required: false },
  ],
  async send() {
    return {
      success: false,
      error:
        "Firebase Phone Auth cannot send OTPs from a server — it is a client-SDK-only flow. Choose a different SMS provider for server-driven OTP delivery.",
    };
  },
};

const CUSTOM_SMS: OtpProviderDefinition = {
  key: "CUSTOM_SMS",
  label: "Custom SMS API",
  channel: "SMS",
  icon: "🔧",
  fields: [
    { key: "apiUrl", label: "API URL", type: "url", secret: false, required: true },
    { key: "apiKey", label: "API Key (sent as Bearer token, optional)", type: "password", secret: true, required: false },
  ],
  async send(creds, { to, message }) {
    return postJson(creds.apiUrl, { to, message }, creds.apiKey ? { Authorization: `Bearer ${creds.apiKey}` } : {});
  },
};

export const SMS_PROVIDERS: OtpProviderDefinition[] = [
  TWILIO_SMS,
  AFRICAS_TALKING_SMS,
  VONAGE_SMS,
  MESSAGEBIRD_SMS,
  PLIVO_SMS,
  INFOBIP_SMS,
  TELNYX_SMS,
  SINCH_SMS,
  CLICKSEND_SMS,
  SMSTO_SMS,
  TEXTBELT_SMS,
  AWS_SNS,
  AZURE_SMS,
  FIREBASE_PHONE_AUTH,
  CUSTOM_SMS,
];
