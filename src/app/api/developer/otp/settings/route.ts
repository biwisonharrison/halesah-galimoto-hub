import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { getOtpSettings, updateOtpSettings, resetOtpSettings } from "@/lib/otpSettings";
import { recordOtpAudit } from "@/lib/otpAudit";

const bodySchema = z.object({
  otpEnabled: z.boolean().optional(),
  otpLength: z.number().int().min(4).max(10).optional(),
  otpFormat: z.enum(["NUMERIC", "ALPHANUMERIC"]).optional(),
  otpExpiryMinutes: z.number().int().min(1).max(60).optional(),
  maxVerifyAttempts: z.number().int().min(1).max(20).optional(),
  maxResendAttempts: z.number().int().min(1).max(20).optional(),
  resendCooldownSeconds: z.number().int().min(0).max(600).optional(),
  maxRequestsPerHour: z.number().int().min(1).max(1000).optional(),
  maxRequestsPerDay: z.number().int().min(1).max(5000).optional(),
  lockoutDurationMinutes: z.number().int().min(1).max(1440).optional(),
  allowedCountries: z.string().nullable().optional(),
  blockedCountries: z.string().nullable().optional(),
  defaultCountryCode: z.string().trim().min(1).max(6).optional(),
  channelPriority: z.array(z.enum(["SMS", "WHATSAPP", "EMAIL"])).optional(),
  webhookDeliveryUrl: z.string().url().nullable().optional().or(z.literal("")),
  webhookVerificationUrl: z.string().url().nullable().optional().or(z.literal("")),
  webhookFailureUrl: z.string().url().nullable().optional().or(z.literal("")),
});

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }
  return NextResponse.json({ settings: await getOtpSettings() });
}

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings." }, { status: 400 });
  }

  const data = { ...parsed.data };
  for (const key of ["webhookDeliveryUrl", "webhookVerificationUrl", "webhookFailureUrl"] as const) {
    if (data[key] === "") data[key] = null;
  }

  const settings = await updateOtpSettings(data, user.id);

  await recordOtpAudit({
    actorId: user.id,
    action: "SETTINGS_UPDATED",
    targetType: "OtpSettings",
    details: `Updated OTP settings: ${Object.keys(parsed.data).join(", ")}.`,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ settings });
}

export async function DELETE(req: NextRequest) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const settings = await resetOtpSettings(user.id);
  await recordOtpAudit({ actorId: user.id, action: "SETTINGS_RESET", targetType: "OtpSettings", ipAddress: req.headers.get("x-forwarded-for") });
  return NextResponse.json({ settings });
}
