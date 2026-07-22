import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/auth";
import { decryptCredentials } from "@/lib/otpEncryption";
import { recordOtpAudit } from "@/lib/otpAudit";

/**
 * Returns the unmasked credential values for one provider. Gated by the same
 * DEVELOPER-only boundary as the rest of this panel (the app has no separate
 * password to re-prompt for, since auth is phone+OTP only) — every reveal is
 * written to OtpAuditLog so there's always a record of who viewed a secret
 * and when.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const config = await prisma.otpProviderConfig.findUnique({ where: { id: params.id } });
  if (!config) return NextResponse.json({ error: "Provider not found." }, { status: 404 });

  const credentials = decryptCredentials(config.credentialsEncrypted);

  await recordOtpAudit({
    actorId: user.id,
    action: "CREDENTIALS_VIEWED",
    targetType: "OtpProviderConfig",
    targetId: config.id,
    details: `Viewed unmasked credentials for "${config.label}".`,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ credentials });
}
