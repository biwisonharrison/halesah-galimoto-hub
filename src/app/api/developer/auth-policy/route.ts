import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { getAuthPolicy, updateAuthPolicy, resetAuthPolicy } from "@/lib/authPolicy";
import { recordOtpAudit } from "@/lib/otpAudit";

const ROLES = ["BUYER", "DEALER", "ADMIN", "DEVELOPER", "MANAGER", "SALES_AGENT", "MODERATOR"] as const;

const bodySchema = z.object({
  requireOtpOnRegistration: z.boolean().optional(),
  requireOtpOnNewDevice: z.boolean().optional(),
  requireOtpOnChangePhone: z.boolean().optional(),
  requireOtpOnChangeEmail: z.boolean().optional(),
  forceOtpForAdmins: z.boolean().optional(),
  forceOtpForRoles: z.array(z.enum(ROLES)).optional(),
  trustedDevicesEnabled: z.boolean().optional(),
  trustedDeviceValidityDays: z.number().int().min(1).max(365).optional(),
  maxTrustedDevicesPerUser: z.number().int().min(1).max(50).optional(),
  forceOtpAfterDeviceExpiry: z.boolean().optional(),
  forceOtpAfterLogout: z.boolean().optional(),
  forceOtpAfterEmailChange: z.boolean().optional(),
  forceOtpAfterPhoneChange: z.boolean().optional(),
  forceOtpAfterSuspiciousLogin: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }
  return NextResponse.json({ policy: await getAuthPolicy() });
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid policy." }, { status: 400 });
  }

  const policy = await updateAuthPolicy(parsed.data, user.id);

  await recordOtpAudit({
    actorId: user.id,
    action: "AUTH_POLICY_UPDATED",
    targetType: "AuthPolicySettings",
    details: `Updated auth policy: ${Object.keys(parsed.data).join(", ")}.`,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ policy });
}

export async function DELETE(req: NextRequest) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const policy = await resetAuthPolicy();
  await recordOtpAudit({ actorId: user.id, action: "AUTH_POLICY_RESET", targetType: "AuthPolicySettings", ipAddress: req.headers.get("x-forwarded-for") });
  return NextResponse.json({ policy });
}
