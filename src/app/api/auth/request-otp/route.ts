import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMalawiPhone } from "@/lib/phone";
import { requestOtp } from "@/lib/otpEngine";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { readTrustedDeviceCookie } from "@/lib/deviceFingerprint";
import { evaluateLoginOtpRequirement, touchTrustedDevice } from "@/lib/authPolicy";

const bodySchema = z.object({ phone: z.string().min(1) });

async function logAttempt(req: NextRequest, phone: string, success: boolean, reason?: string) {
  await prisma.loginAttempt
    .create({
      data: {
        phone,
        success,
        reason,
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    })
    .catch(() => null);
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a phone number." }, { status: 400 });
  }

  const phone = normalizeMalawiPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid Malawian phone number." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing && !existing.active) {
    await logAttempt(req, phone, false, "account_suspended");
    return NextResponse.json({ error: "This account has been suspended. Contact support for help." }, { status: 403 });
  }

  const deviceToken = await readTrustedDeviceCookie();
  const { requiresOtp, trustedDevice } = await evaluateLoginOtpRequirement(existing, deviceToken);

  if (!requiresOtp && existing && trustedDevice) {
    await touchTrustedDevice(trustedDevice.id, req.headers.get("x-forwarded-for"));
    await setSessionCookie({ userId: existing.id, phone: existing.phone, role: existing.role });
    await logAttempt(req, phone, true, "trusted_device");
    return NextResponse.json({ ok: true, phone, skippedOtp: true, user: { id: existing.id, name: existing.name, role: existing.role } });
  }

  const result = await requestOtp({
    purpose: "LOGIN",
    phone,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 429 });
  }

  return NextResponse.json({ ok: true, phone, skippedOtp: false });
}
