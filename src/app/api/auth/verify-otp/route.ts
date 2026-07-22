import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMalawiPhone } from "@/lib/phone";
import { verifyOtp } from "@/lib/otpEngine";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { rememberDevice } from "@/lib/authPolicy";

const bodySchema = z.object({
  phone: z.string().min(1),
  code: z.string().min(4).max(12),
  name: z.string().trim().min(1).max(100).optional(),
  rememberDevice: z.boolean().optional(),
});

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
    return NextResponse.json({ error: "Enter the 6 digit code." }, { status: 400 });
  }

  const phone = normalizeMalawiPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid Malawian phone number." }, { status: 400 });
  }

  const result = await verifyOtp({
    purpose: "LOGIN",
    phone,
    code: parsed.data.code,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  if (!result.ok) {
    await logAttempt(req, phone, false, "invalid_or_expired_code");
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing && !existing.active) {
    await logAttempt(req, phone, false, "account_suspended");
    return NextResponse.json({ error: "This account has been suspended. Contact support for help." }, { status: 403 });
  }

  const user = await prisma.user.upsert({
    where: { phone },
    update: { phoneVerifiedAt: new Date() },
    create: { phone, name: parsed.data.name, phoneVerifiedAt: new Date() },
  });

  await setSessionCookie({ userId: user.id, phone: user.phone, role: user.role });
  await logAttempt(req, phone, true);

  if (parsed.data.rememberDevice) {
    await rememberDevice(user.id, req.headers.get("user-agent"), req.headers.get("x-forwarded-for"));
  }

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
}
