import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { getSellerSharingSettings, updateSellerSharingSettings, RESERVED_URL_PREFIXES } from "@/lib/sellerSharingSettings";

const settingsSchema = z.object({
  enabled: z.boolean(),

  allowCopyLink: z.boolean(),
  allowWhatsappShare: z.boolean(),
  allowFacebookShare: z.boolean(),
  allowTwitterShare: z.boolean(),
  allowTelegramShare: z.boolean(),
  allowEmailShare: z.boolean(),
  allowNativeShare: z.boolean(),

  urlPrefix: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only, no slashes.")
    .refine((v) => !RESERVED_URL_PREFIXES.includes(v), "That prefix is already used by another page on this site."),
  slugFormat: z.enum(["BUSINESS_NAME", "BUSINESS_NAME_SHORT_ID"]),
  fallbackUrl: z.string().trim().min(1).max(200),
  disabledMessage: z.string().trim().min(1).max(300),

  seoIndexing: z.boolean(),
  seoSitemap: z.boolean(),
  seoStructuredData: z.boolean(),
  seoOpenGraph: z.boolean(),
  seoTwitterCard: z.boolean(),

  analyticsPageViews: z.boolean(),
  analyticsListingClicks: z.boolean(),
  analyticsPhoneClicks: z.boolean(),
  analyticsWhatsappClicks: z.boolean(),
  analyticsShareCounts: z.boolean(),

  securityRequireVerification: z.boolean(),
  securityHideLocation: z.boolean(),
  securityHidePhone: z.boolean(),
  securityHideWhatsapp: z.boolean(),
  securityRateLimitEnabled: z.boolean(),
  securityRateLimitPerMinute: z.number().int().min(1).max(1000),
});

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }
  const settings = await getSellerSharingSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the form fields." }, { status: 400 });
  }

  const settings = await updateSellerSharingSettings(parsed.data, developer.id);
  return NextResponse.json({ settings });
}
