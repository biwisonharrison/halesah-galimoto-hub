import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { updateSiteSettings } from "@/lib/siteSettings";

const emptyToNull = (schema: z.ZodString) => schema.optional().or(z.literal("")).transform((v) => (v ? v : null));

const bodySchema = z.object({
  contactEmail: emptyToNull(z.string().trim().email()),
  contactPhone: emptyToNull(z.string().trim().max(30)),
  whatsappNumber: emptyToNull(z.string().trim().max(30)),
  address: emptyToNull(z.string().trim().max(300)),
  companyName: emptyToNull(z.string().trim().max(150)),
  registrationNumber: emptyToNull(z.string().trim().max(60)),

  currency: z.string().trim().min(1).max(10),
  timezone: z.string().trim().min(1).max(60),
  taxRatePercent: z.union([z.number().min(0).max(100), z.null()]),

  maintenanceMode: z.boolean(),
  maintenanceMessage: emptyToNull(z.string().trim().max(500)),

  facebookUrl: emptyToNull(z.string().trim().url()),
  twitterUrl: emptyToNull(z.string().trim().url()),
  instagramUrl: emptyToNull(z.string().trim().url()),
  tiktokUrl: emptyToNull(z.string().trim().url()),

  smtpHost: emptyToNull(z.string().trim().max(200)),
  smtpPort: z.union([z.number().int().min(1).max(65535), z.null()]),
  smtpUsername: emptyToNull(z.string().trim().max(200)),
  smtpPassword: emptyToNull(z.string().trim().max(200)),
  smtpFromEmail: emptyToNull(z.string().trim().email()),

  notifyEmailEnabled: z.boolean(),
  notifyWhatsappEnabled: z.boolean(),
});

export async function PATCH(req: Request) {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the form fields." }, { status: 400 });
  }

  const settings = await updateSiteSettings(parsed.data, developer.id);
  return NextResponse.json({ settings });
}
