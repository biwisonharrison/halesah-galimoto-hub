import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/auth";
import { getProviderDefinition } from "@/lib/otpProviders/registry";
import { decryptCredentials, encryptCredentials } from "@/lib/otpEncryption";
import { toSafeProviderConfig } from "@/lib/otpProviderConfig";
import { recordOtpAudit } from "@/lib/otpAudit";

const bodySchema = z.object({
  action: z.enum(["update", "activate", "deactivate"]),
  label: z.string().trim().min(1).max(80).optional(),
  chainRole: z.enum(["PRIMARY", "BACKUP"]).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  dailyLimit: z.number().int().min(0).nullable().optional(),
  monthlyLimit: z.number().int().min(0).nullable().optional(),
  credentials: z.record(z.string()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const config = await prisma.otpProviderConfig.findUnique({ where: { id: params.id } });
  if (!config) return NextResponse.json({ error: "Provider not found." }, { status: 404 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const data = parsed.data;
  const ip = req.headers.get("x-forwarded-for");

  if (data.action === "activate") {
    if (config.chainRole === "PRIMARY") {
      await prisma.otpProviderConfig.updateMany({
        where: { channel: config.channel, chainRole: "PRIMARY", id: { not: config.id } },
        data: { isActive: false },
      });
    }
    const updated = await prisma.otpProviderConfig.update({ where: { id: config.id }, data: { isActive: true } });
    await recordOtpAudit({
      actorId: user.id,
      action: "PROVIDER_ACTIVATED",
      targetType: "OtpProviderConfig",
      targetId: config.id,
      details: `Activated "${config.label}" for ${config.channel}.`,
      ipAddress: ip,
    });
    return NextResponse.json({ provider: toSafeProviderConfig(updated) });
  }

  if (data.action === "deactivate") {
    const updated = await prisma.otpProviderConfig.update({ where: { id: config.id }, data: { isActive: false } });
    await recordOtpAudit({
      actorId: user.id,
      action: "PROVIDER_DEACTIVATED",
      targetType: "OtpProviderConfig",
      targetId: config.id,
      details: `Deactivated "${config.label}".`,
      ipAddress: ip,
    });
    return NextResponse.json({ provider: toSafeProviderConfig(updated) });
  }

  // action === "update"
  const definition = getProviderDefinition(config.providerKey);
  if (!definition) return NextResponse.json({ error: "Unknown provider." }, { status: 400 });

  let credentialsEncrypted = config.credentialsEncrypted;
  let rotated = false;
  if (data.credentials) {
    const existing = decryptCredentials(config.credentialsEncrypted);
    const merged = { ...existing, ...data.credentials };
    for (const field of definition.fields) {
      if (field.required && !merged[field.key]) {
        return NextResponse.json({ error: `${field.label} is required for ${definition.label}.` }, { status: 400 });
      }
    }
    credentialsEncrypted = encryptCredentials(merged);
    rotated = true;
  }

  const updated = await prisma.otpProviderConfig.update({
    where: { id: config.id },
    data: {
      label: data.label ?? config.label,
      chainRole: data.chainRole ?? config.chainRole,
      priority: data.priority ?? config.priority,
      dailyLimit: data.dailyLimit === undefined ? config.dailyLimit : data.dailyLimit,
      monthlyLimit: data.monthlyLimit === undefined ? config.monthlyLimit : data.monthlyLimit,
      credentialsEncrypted,
    },
  });

  await recordOtpAudit({
    actorId: user.id,
    action: rotated ? "CREDENTIALS_ROTATED" : "PROVIDER_UPDATED",
    targetType: "OtpProviderConfig",
    targetId: config.id,
    details: rotated ? `Rotated credentials for "${config.label}".` : `Updated settings for "${config.label}".`,
    ipAddress: ip,
  });

  return NextResponse.json({ provider: toSafeProviderConfig(updated) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const config = await prisma.otpProviderConfig.findUnique({ where: { id: params.id } });
  if (!config) return NextResponse.json({ error: "Provider not found." }, { status: 404 });

  await prisma.otpProviderConfig.delete({ where: { id: config.id } });
  await recordOtpAudit({
    actorId: user.id,
    action: "PROVIDER_DELETED",
    targetType: "OtpProviderConfig",
    targetId: config.id,
    details: `Deleted "${config.label}" (${config.providerKey}, ${config.channel}).`,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
