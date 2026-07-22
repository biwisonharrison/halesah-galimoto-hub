import "server-only";
import type { OtpProviderDefinition } from "./types";
import { postJson, basicAuthHeader } from "./httpHelpers";

const SMTP_EMAIL: OtpProviderDefinition = {
  key: "SMTP",
  label: "SMTP Server",
  channel: "EMAIL",
  icon: "✉️",
  fields: [
    { key: "apiUrl", label: "SMTP Host", type: "text", secret: false, required: true, placeholder: "smtp.example.com" },
    { key: "senderNumber", label: "Port", type: "number", secret: false, required: true, defaultValue: "587" },
    { key: "username", label: "Username", type: "text", secret: false, required: true },
    { key: "password", label: "Password", type: "password", secret: true, required: true },
    { key: "senderId", label: "From Email", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message, subject }) {
    try {
      const nodemailer = await import("nodemailer");
      const port = Number(creds.senderNumber) || 587;
      const transporter = nodemailer.createTransport({
        host: creds.apiUrl,
        port,
        secure: port === 465,
        auth: { user: creds.username, pass: creds.password },
      });
      const info = await transporter.sendMail({
        from: creds.senderId,
        to,
        subject: subject || "Verification Code",
        text: message,
      });
      return { success: true, providerResponse: info.messageId ?? "sent" };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "SMTP error" };
    }
  },
};

const SENDGRID_EMAIL: OtpProviderDefinition = {
  key: "SENDGRID",
  label: "SendGrid",
  channel: "EMAIL",
  icon: "✉️",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderId", label: "From Email", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message, subject }) {
    return postJson(
      "https://api.sendgrid.com/v3/mail/send",
      {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: creds.senderId },
        subject: subject || "Verification Code",
        content: [{ type: "text/plain", value: message }],
      },
      { Authorization: `Bearer ${creds.apiKey}` }
    );
  },
};

const MAILGUN_EMAIL: OtpProviderDefinition = {
  key: "MAILGUN",
  label: "Mailgun",
  channel: "EMAIL",
  icon: "✉️",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "clientId", label: "Domain", type: "text", secret: false, required: true, placeholder: "mg.example.com" },
    { key: "senderId", label: "From Email", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message, subject }) {
    try {
      const res = await fetch(`https://api.mailgun.net/v3/${creds.clientId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: basicAuthHeader("api", creds.apiKey),
        },
        body: new URLSearchParams({ from: creds.senderId, to, subject: subject || "Verification Code", text: message }).toString(),
      });
      const text = (await res.text().catch(() => "")).slice(0, 500);
      if (!res.ok) return { success: false, error: `HTTP ${res.status}: ${text}` };
      return { success: true, providerResponse: text };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Network error" };
    }
  },
};

const AMAZON_SES_EMAIL: OtpProviderDefinition = {
  key: "AMAZON_SES",
  label: "Amazon SES",
  channel: "EMAIL",
  icon: "✉️",
  fields: [
    { key: "clientId", label: "Access Key ID", type: "text", secret: false, required: true },
    { key: "clientSecret", label: "Secret Access Key", type: "password", secret: true, required: true },
    { key: "region", label: "Region", type: "text", secret: false, required: true, placeholder: "eu-west-1" },
    { key: "senderId", label: "From Email", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message, subject }) {
    try {
      const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");
      const client = new SESClient({
        region: creds.region,
        credentials: { accessKeyId: creds.clientId, secretAccessKey: creds.clientSecret },
      });
      const res = await client.send(
        new SendEmailCommand({
          Source: creds.senderId,
          Destination: { ToAddresses: [to] },
          Message: {
            Subject: { Data: subject || "Verification Code" },
            Body: { Text: { Data: message } },
          },
        })
      );
      return { success: true, providerResponse: res.MessageId ?? "sent" };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Amazon SES error" };
    }
  },
};

const POSTMARK_EMAIL: OtpProviderDefinition = {
  key: "POSTMARK",
  label: "Postmark",
  channel: "EMAIL",
  icon: "✉️",
  fields: [
    { key: "apiKey", label: "Server Token", type: "password", secret: true, required: true },
    { key: "senderId", label: "From Email", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message, subject }) {
    return postJson(
      "https://api.postmarkapp.com/email",
      { From: creds.senderId, To: to, Subject: subject || "Verification Code", TextBody: message },
      { "X-Postmark-Server-Token": creds.apiKey, Accept: "application/json" }
    );
  },
};

const RESEND_EMAIL: OtpProviderDefinition = {
  key: "RESEND",
  label: "Resend",
  channel: "EMAIL",
  icon: "✉️",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderId", label: "From Email", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message, subject }) {
    return postJson(
      "https://api.resend.com/emails",
      { from: creds.senderId, to: [to], subject: subject || "Verification Code", text: message },
      { Authorization: `Bearer ${creds.apiKey}` }
    );
  },
};

const BREVO_EMAIL: OtpProviderDefinition = {
  key: "BREVO",
  label: "Brevo (Sendinblue)",
  channel: "EMAIL",
  icon: "✉️",
  fields: [
    { key: "apiKey", label: "API Key", type: "password", secret: true, required: true },
    { key: "senderId", label: "From Email", type: "text", secret: false, required: true },
  ],
  async send(creds, { to, message, subject }) {
    return postJson(
      "https://api.brevo.com/v3/smtp/email",
      { sender: { email: creds.senderId }, to: [{ email: to }], subject: subject || "Verification Code", textContent: message },
      { "api-key": creds.apiKey, Accept: "application/json" }
    );
  },
};

const CUSTOM_EMAIL: OtpProviderDefinition = {
  key: "CUSTOM_EMAIL",
  label: "Custom Email API",
  channel: "EMAIL",
  icon: "🔧",
  fields: [
    { key: "apiUrl", label: "API URL", type: "url", secret: false, required: true },
    { key: "apiKey", label: "API Key (sent as Bearer token, optional)", type: "password", secret: true, required: false },
  ],
  async send(creds, { to, message, subject }) {
    return postJson(
      creds.apiUrl,
      { to, subject: subject || "Verification Code", body: message },
      creds.apiKey ? { Authorization: `Bearer ${creds.apiKey}` } : {}
    );
  },
};

export const EMAIL_PROVIDERS: OtpProviderDefinition[] = [
  SMTP_EMAIL,
  SENDGRID_EMAIL,
  MAILGUN_EMAIL,
  AMAZON_SES_EMAIL,
  POSTMARK_EMAIL,
  RESEND_EMAIL,
  BREVO_EMAIL,
  CUSTOM_EMAIL,
];
