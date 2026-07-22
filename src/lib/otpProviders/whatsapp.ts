import "server-only";
import type { OtpProviderDefinition } from "./types";
import { postJson, basicAuthHeader } from "./httpHelpers";

function waNumber(to: string): string {
  return to.replace(/^\+/, "");
}

const TWILIO_WHATSAPP: OtpProviderDefinition = {
  key: "TWILIO_WHATSAPP",
  label: "Twilio WhatsApp",
  channel: "WHATSAPP",
  icon: "💬",
  fields: [
    { key: "accountSid", label: "Account SID", type: "text", secret: false, required: true },
    { key: "authToken", label: "Auth Token", type: "password", secret: true, required: true },
    { key: "whatsappBusinessNumber", label: "WhatsApp Business Number", type: "text", secret: false, required: true, placeholder: "+14155238886" },
  ],
  async send(creds, { to, message }) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${creds.whatsappBusinessNumber}`,
      Body: message,
    }).toString();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: basicAuthHeader(creds.accountSid, creds.authToken),
        },
        body,
      });
      const text = (await res.text().catch(() => "")).slice(0, 500);
      if (!res.ok) return { success: false, error: `HTTP ${res.status}: ${text}` };
      return { success: true, providerResponse: text };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Network error" };
    }
  },
};

const META_WHATSAPP: OtpProviderDefinition = {
  key: "META_WHATSAPP_CLOUD",
  label: "Meta WhatsApp Cloud API",
  channel: "WHATSAPP",
  icon: "💬",
  fields: [
    { key: "accessToken", label: "Access Token", type: "password", secret: true, required: true },
    { key: "whatsappPhoneNumberId", label: "WhatsApp Phone Number ID", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message }) {
    return postJson(
      `https://graph.facebook.com/v19.0/${creds.whatsappPhoneNumberId}/messages`,
      { messaging_product: "whatsapp", to: waNumber(to), type: "text", text: { body: message } },
      { Authorization: `Bearer ${creds.accessToken}` }
    );
  },
};

const AFRICAS_TALKING_WHATSAPP: OtpProviderDefinition = {
  key: "AFRICASTALKING_WHATSAPP",
  label: "Africa's Talking WhatsApp",
  channel: "WHATSAPP",
  icon: "💬",
  notes: "Follows Africa's Talking's published WhatsApp message-send schema — confirm field names against your account's API docs if delivery fails.",
  fields: [
    { key: "username", label: "Username", type: "text", secret: false, required: true },
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "whatsappBusinessNumber", label: "WhatsApp Business Number", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message }) {
    return postJson(
      "https://chat.africastalking.com/whatsapp/message/send",
      { username: creds.username, from: creds.whatsappBusinessNumber, to, message: { text: { body: message } } },
      { apiKey: creds.apiKey, Accept: "application/json" }
    );
  },
};

const MESSAGEBIRD_WHATSAPP: OtpProviderDefinition = {
  key: "MESSAGEBIRD_WHATSAPP",
  label: "MessageBird WhatsApp",
  channel: "WHATSAPP",
  icon: "💬",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "whatsappBusinessNumber", label: "WhatsApp Business Number (channel ID)", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message }) {
    return postJson(
      "https://conversations.messagebird.com/v1/send",
      { to, from: creds.whatsappBusinessNumber, type: "text", content: { text: message } },
      { Authorization: `AccessKey ${creds.apiKey}` }
    );
  },
};

const VONAGE_WHATSAPP: OtpProviderDefinition = {
  key: "VONAGE_WHATSAPP",
  label: "Vonage WhatsApp",
  channel: "WHATSAPP",
  icon: "💬",
  notes: "Uses the Vonage Messages API sandbox-compatible API key/secret auth. Production WhatsApp senders on Vonage typically require JWT + Application ID auth instead — update this adapter if your account needs that.",
  fields: [
    { key: "apiKey", label: "API Key", type: "text", secret: false, required: true },
    { key: "apiSecret", label: "API Secret", type: "password", secret: true, required: true },
    { key: "whatsappBusinessNumber", label: "WhatsApp Business Number", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message }) {
    return postJson(
      "https://messages-sandbox.nexmo.com/v1/messages",
      { from: creds.whatsappBusinessNumber, to, message_type: "text", text: message, channel: "whatsapp" },
      { Authorization: basicAuthHeader(creds.apiKey, creds.apiSecret) }
    );
  },
};

const CUSTOM_WHATSAPP: OtpProviderDefinition = {
  key: "CUSTOM_WHATSAPP",
  label: "Custom WhatsApp API",
  channel: "WHATSAPP",
  icon: "🔧",
  fields: [
    { key: "apiUrl", label: "API URL", type: "url", secret: false, required: true },
    { key: "apiKey", label: "API Key (sent as Bearer token, optional)", type: "password", secret: true, required: false },
  ],
  async send(creds, { to, message }) {
    return postJson(creds.apiUrl, { to, message }, creds.apiKey ? { Authorization: `Bearer ${creds.apiKey}` } : {});
  },
};

export const WHATSAPP_PROVIDERS: OtpProviderDefinition[] = [
  TWILIO_WHATSAPP,
  META_WHATSAPP,
  AFRICAS_TALKING_WHATSAPP,
  MESSAGEBIRD_WHATSAPP,
  VONAGE_WHATSAPP,
  CUSTOM_WHATSAPP,
];
