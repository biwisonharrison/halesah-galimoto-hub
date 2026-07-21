import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMalawiPhone } from "@/lib/phone";
import { verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

const bodySchema = z.object({
  phone: z.string().min(1),
  code: z.string().length(6),
  name: z.string().trim().min(1).max(100).optional(),
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

  const isValid = await verifyOtp(phone, parsed.data.code);
  if (!isValid) {
    await logAttempt(req, phone, false, "invalid_or_expired_code");
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
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

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
}
