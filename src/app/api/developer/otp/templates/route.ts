import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { listTemplates, upsertTemplate } from "@/lib/otpTemplates";
import { recordOtpAudit } from "@/lib/otpAudit";

const bodySchema = z.object({
  purpose: z.enum(["LOGIN", "REGISTRATION", "PASSWORD_RESET", "CHANGE_PHONE", "CHANGE_EMAIL", "HIGH_RISK_LOGIN", "TWO_FACTOR"]),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL"]),
  body: z.string().trim().min(1).max(2000),
  subject: z.string().trim().max(200).optional(),
});

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }
  return NextResponse.json({ templates: await listTemplates() });
}

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid template." }, { status: 400 });

  const template = await upsertTemplate(parsed.data.purpose, parsed.data.channel, parsed.data.body, parsed.data.subject ?? null);

  await recordOtpAudit({
    actorId: user.id,
    action: "TEMPLATE_UPDATED",
    targetType: "OtpTemplate",
    targetId: template.id,
    details: `Updated ${parsed.data.purpose}/${parsed.data.channel} template.`,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ template });
}
