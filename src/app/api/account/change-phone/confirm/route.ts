import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { normalizeMalawiPhone } from "@/lib/phone";
import { verifyOtp } from "@/lib/otpEngine";
import { prisma } from "@/lib/prisma";
import { getAuthPolicy, revokeAllTrustedDevices } from "@/lib/authPolicy";

const bodySchema = z.object({ newPhone: z.string().min(1), code: z.string().min(4).max(12) });

export async function POST(req: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the code." }, { status: 400 });

  const newPhone = normalizeMalawiPhone(parsed.data.newPhone);
  if (!newPhone) return NextResponse.json({ error: "Enter a valid Malawian phone number." }, { status: 400 });

  const result = await verifyOtp({
    purpose: "CHANGE_PHONE",
    phone: newPhone,
    code: parsed.data.code,
    userId: user.id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  try {
    await prisma.user.update({ where: { id: user.id }, data: { phone: newPhone, phoneVerifiedAt: new Date() } });
  } catch {
    return NextResponse.json({ error: "Another account already uses that phone number." }, { status: 409 });
  }

  const policy = await getAuthPolicy();
  if (policy.forceOtpAfterPhoneChange) await revokeAllTrustedDevices(user.id);

  return NextResponse.json({ ok: true, phone: newPhone });
}
