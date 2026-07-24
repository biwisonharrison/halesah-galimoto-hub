import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSellerSharingSettings } from "@/lib/sellerSharingSettings";

/**
 * First sitemap in this app. Scope kept minimal for now: the homepage plus
 * public seller inventory pages (when the feature and its sitemap toggle are
 * both on) — the pages the Developer Panel's "Sitemap inclusion" setting
 * refers to.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.halesahgalimotohub.com";
  const entries: MetadataRoute.Sitemap = [{ url: origin, lastModified: new Date() }];

  const settings = await getSellerSharingSettings();
  if (!settings.enabled || !settings.seoSitemap) return entries;

  const sellers = await prisma.sellerAccount.findMany({
    where: { sharingStatus: "ENABLED", slug: { not: null } },
    select: { slug: true, updatedAt: true },
  });

  for (const seller of sellers) {
    if (!seller.slug) continue;
    entries.push({ url: `${origin}/${settings.urlPrefix}/${seller.slug}`, lastModified: seller.updatedAt });
  }

  return entries;
}
