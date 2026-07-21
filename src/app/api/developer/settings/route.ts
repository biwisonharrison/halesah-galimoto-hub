import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/siteSettings";

const brandingSchema = z.object({
  siteName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  logoUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  faviconUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #137d54"),
  secondaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #0D2A4A"),
  fontFamily: z.string().trim().min(1).max(60),
});

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = brandingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the form fields." }, { status: 400 });
  }

  const { siteName, tagline, logoUrl, faviconUrl, primaryColor, secondaryColor, fontFamily } = parsed.data;
  const settings = await updateSiteSettings(
    {
      siteName,
      tagline: tagline || null,
      logoUrl: logoUrl || null,
      faviconUrl: faviconUrl || null,
      primaryColor,
      secondaryColor,
      fontFamily,
    },
    developer.id
  );

  return NextResponse.json({ settings });
}
