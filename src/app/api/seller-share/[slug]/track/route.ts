import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSellerSharingSettings } from "@/lib/sellerSharingSettings";
import { checkRateLimit } from "@/lib/sellerSharingRateLimit";

const bodySchema = z.object({
  event: z.enum(["listing_click", "phone_click", "whatsapp_click", "share_click"]),
});

const COUNTER_FIELD_BY_EVENT = {
  listing_click: "shareLinkListingClicks",
  phone_click: "shareLinkPhoneClicks",
  whatsapp_click: "shareLinkWhatsappClicks",
  share_click: "shareLinkShareClicks",
} as const;

const ANALYTICS_TOGGLE_BY_EVENT = {
  listing_click: "analyticsListingClicks",
  phone_click: "analyticsPhoneClicks",
  whatsapp_click: "analyticsWhatsappClicks",
  share_click: "analyticsShareCounts",
} as const;

/**
 * Public, unauthenticated, best-effort click tracking for a seller's share page.
 * Analytics must never break the page: every failure is swallowed. No-ops
 * entirely when the feature is globally disabled — satisfies "API endpoints
 * related to seller inventory sharing are disabled" when the master switch is off.
 */
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const settings = await getSellerSharingSettings();
    if (!settings.enabled) return NextResponse.json({ ok: true });

    if (settings.securityRateLimitEnabled) {
      const ip = req.headers.get("x-forwarded-for") ?? "unknown";
      if (!checkRateLimit(`seller-share-track:${ip}`, settings.securityRateLimitPerMinute)) {
        return NextResponse.json({ ok: true });
      }
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

    if (!settings[ANALYTICS_TOGGLE_BY_EVENT[parsed.data.event]]) return NextResponse.json({ ok: true });

    await prisma.sellerAccount.update({
      where: { slug: params.slug },
      data: { [COUNTER_FIELD_BY_EVENT[parsed.data.event]]: { increment: 1 } },
    });
  } catch {
    // swallow: analytics must never break navigation
  }

  return NextResponse.json({ ok: true });
}
