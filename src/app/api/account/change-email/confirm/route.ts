import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { verifyOtp } from "@/lib/otpEngine";
import { prisma } from "@/lib/prisma";
import { getAuthPolicy, revokeAllTrustedDevices } from "@/lib/authPolicy";

const bodySchema = z.object({ newEmail: z.string().trim().email(), code: z.string().min(4).max(12) });

export async function POST(req: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the code." }, { status: 400 });

  const newEmail = parsed.data.newEmail.toLowerCase();
  const result = await verifyOtp({
    purpose: "CHANGE_EMAIL",
    email: newEmail,
    code: parsed.data.code,
    userId: user.id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  try {
    await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
  } catch {
    return NextResponse.json({ error: "Another account already uses that email address." }, { status: 409 });
  }

  const policy = await getAuthPolicy();
  if (policy.forceOtpAfterEmailChange) await revokeAllTrustedDevices(user.id);

  return NextResponse.json({ ok: true, email: newEmail });
}
