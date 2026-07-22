import "server-only";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import type { OtpPurpose, OtpChannel } from "@prisma/client";

export const TEMPLATE_PLACEHOLDERS = ["{{OTP}}", "{{APP_NAME}}", "{{USER_NAME}}", "{{EXPIRY}}", "{{DATE}}", "{{TIME}}"];

const DEFAULT_BODIES: Record<OtpChannel, string> = {
  SMS: "Your verification code is {{OTP}}. It expires in {{EXPIRY}} minutes.",
  WHATSAPP: "Your verification code is {{OTP}}. It expires in {{EXPIRY}} minutes.",
  EMAIL: "Your verification code is {{OTP}}.\nIt expires in {{EXPIRY}} minutes.",
};

const DEFAULT_SUBJECT = "Verification Code";

export async function getTemplate(purpose: OtpPurpose, channel: OtpChannel): Promise<{ subject: string | null; body: string }> {
  const template = await prisma.otpTemplate.findUnique({ where: { purpose_channel: { purpose, channel } } });
  if (template) return { subject: template.subject, body: template.body };
  return { subject: channel === "EMAIL" ? DEFAULT_SUBJECT : null, body: DEFAULT_BODIES[channel] };
}

export async function upsertTemplate(purpose: OtpPurpose, channel: OtpChannel, body: string, subject?: string | null) {
  return prisma.otpTemplate.upsert({
    where: { purpose_channel: { purpose, channel } },
    update: { body, subject },
    create: { purpose, channel, body, subject },
  });
}

export async function listTemplates() {
  return prisma.otpTemplate.findMany({ orderBy: [{ purpose: "asc" }, { channel: "asc" }] });
}

export async function renderTemplate(
  template: { subject: string | null; body: string },
  vars: { otp: string; userName?: string | null; expiryMinutes: number }
): Promise<{ subject?: string; body: string }> {
  const settings = await getSiteSettings();
  const now = new Date();

  const substitute = (text: string) =>
    text
      .replaceAll("{{OTP}}", vars.otp)
      .replaceAll("{{APP_NAME}}", settings.siteName)
      .replaceAll("{{USER_NAME}}", vars.userName || "there")
      .replaceAll("{{EXPIRY}}", String(vars.expiryMinutes))
      .replaceAll("{{DATE}}", now.toLocaleDateString())
      .replaceAll("{{TIME}}", now.toLocaleTimeString());

  return {
    subject: template.subject ? substitute(template.subject) : undefined,
    body: substitute(template.body),
  };
}
