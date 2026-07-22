import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { requestOtp } from "@/lib/otpEngine";
import { prisma } from "@/lib/prisma";
import { getAuthPolicy, revokeAllTrustedDevices } from "@/lib/authPolicy";

const bodySchema = z.object({ newEmail: z.string().trim().email() });

export async function POST(req: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const newEmail = parsed.data.newEmail.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing && existing.id !== user.id) {
    return NextResponse.json({ error: "Another account already uses that email address." }, { status: 409 });
  }

  const policy = await getAuthPolicy();
  if (!policy.requireOtpOnChangeEmail) {
    await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
    if (policy.forceOtpAfterEmailChange) await revokeAllTrustedDevices(user.id);
    return NextResponse.json({ ok: true, applied: true, email: newEmail });
  }

  const result = await requestOtp({
    purpose: "CHANGE_EMAIL",
    email: newEmail,
    userId: user.id,
    userName: user.name,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 429 });

  return NextResponse.json({ ok: true, applied: false });
}
