import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/auth";
import { getProviderDefinition } from "@/lib/otpProviders/registry";
import { encryptCredentials } from "@/lib/otpEncryption";
import { toSafeProviderConfig } from "@/lib/otpProviderConfig";
import { recordOtpAudit } from "@/lib/otpAudit";

const bodySchema = z.object({
  providerKey: z.string().min(1),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL"]),
  label: z.string().trim().min(1).max(80),
  environment: z.enum(["SANDBOX", "PRODUCTION"]).default("PRODUCTION"),
  chainRole: z.enum(["PRIMARY", "BACKUP"]).default("PRIMARY"),
  priority: z.number().int().min(0).max(100).default(0),
  dailyLimit: z.number().int().min(0).nullable().optional(),
  monthlyLimit: z.number().int().min(0).nullable().optional(),
  credentials: z.record(z.string()),
});

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const configs = await prisma.otpProviderConfig.findMany({ orderBy: [{ channel: "asc" }, { chainRole: "asc" }, { priority: "asc" }] });
  return NextResponse.json({ providers: configs.map(toSafeProviderConfig) });
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid provider configuration." }, { status: 400 });
  }
  const data = parsed.data;

  const definition = getProviderDefinition(data.providerKey);
  if (!definition) return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
  if (definition.channel !== data.channel) {
    return NextResponse.json({ error: `${definition.label} is a ${definition.channel} provider, not ${data.channel}.` }, { status: 400 });
  }

  for (const field of definition.fields) {
    if (field.required && !data.credentials[field.key]) {
      return NextResponse.json({ error: `${field.label} is required for ${definition.label}.` }, { status: 400 });
    }
    if (field.type === "url" && data.credentials[field.key]) {
      try {
        new URL(data.credentials[field.key]);
      } catch {
        return NextResponse.json({ error: `${field.label} must be a valid URL.` }, { status: 400 });
      }
    }
  }

  const config = await prisma.otpProviderConfig.create({
    data: {
      providerKey: data.providerKey,
      channel: data.channel,
      label: data.label,
      environment: data.environment,
      chainRole: data.chainRole,
      priority: data.priority,
      dailyLimit: data.dailyLimit ?? null,
      monthlyLimit: data.monthlyLimit ?? null,
      credentialsEncrypted: encryptCredentials(data.credentials),
      isActive: false,
    },
  });

  await recordOtpAudit({
    actorId: user.id,
    action: "PROVIDER_CREATED",
    targetType: "OtpProviderConfig",
    targetId: config.id,
    details: `Created ${definition.label} (${data.channel}, ${data.chainRole}) as "${data.label}".`,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ provider: toSafeProviderConfig(config) });
}
