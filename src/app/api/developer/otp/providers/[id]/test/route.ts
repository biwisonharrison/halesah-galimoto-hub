import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/auth";
import { getProviderDefinition } from "@/lib/otpProviders/registry";
import { decryptCredentials } from "@/lib/otpEncryption";
import { getSiteSettings } from "@/lib/siteSettings";
import { recordOtpAudit } from "@/lib/otpAudit";

const bodySchema = z.object({ to: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const config = await prisma.otpProviderConfig.findUnique({ where: { id: params.id } });
  if (!config) return NextResponse.json({ error: "Provider not found." }, { status: 404 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a phone number or email to test with." }, { status: 400 });

  const definition = getProviderDefinition(config.providerKey);
  if (!definition) return NextResponse.json({ error: "Unknown provider." }, { status: 400 });

  const settings = await getSiteSettings();
  const message = `This is a test message from ${settings.siteName}'s OTP configuration. If you received this, ${definition.label} is working.`;

  const start = Date.now();
  let result;
  try {
    const credentials = decryptCredentials(config.credentialsEncrypted);
    result = await definition.send(credentials, { to: parsed.data.to, message, subject: "OTP Configuration Test" });
  } catch (err) {
    result = { success: false, error: err instanceof Error ? err.message : "Test send failed" };
  }
  const responseTimeMs = Date.now() - start;

  await prisma.otpProviderConfig.update({
    where: { id: config.id },
    data: {
      lastTestedAt: new Date(),
      lastTestStatus: result.success ? "SUCCESS" : "FAILED",
      lastTestResponse: result.success ? result.providerResponse ?? null : null,
      lastTestError: result.success ? null : result.error ?? null,
      lastTestResponseMs: responseTimeMs,
    },
  });

  await recordOtpAudit({
    actorId: user.id,
    action: "PROVIDER_TESTED",
    targetType: "OtpProviderConfig",
    targetId: config.id,
    details: `Test send via "${config.label}" to ${parsed.data.to}: ${result.success ? "success" : "failed"}.`,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({
    success: result.success,
    providerResponse: result.success ? result.providerResponse : undefined,
    error: result.success ? undefined : result.error,
    responseTimeMs,
  });
}
