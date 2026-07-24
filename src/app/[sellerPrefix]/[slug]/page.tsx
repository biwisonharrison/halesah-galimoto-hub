import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSellerSharingSettings } from "@/lib/sellerSharingSettings";
import { checkRateLimit } from "@/lib/sellerSharingRateLimit";
import { getSiteSettings } from "@/lib/siteSettings";
import SellerShareListingGrid from "@/components/SellerShareListingGrid";
import SellerShareContactButtons from "@/components/SellerShareContactButtons";

async function loadSeller(params: { sellerPrefix: string; slug: string }) {
  const settings = await getSellerSharingSettings();
  if (params.sellerPrefix !== settings.urlPrefix) return { settings, seller: null, listings: [] as never[] };

  if (!settings.enabled) return { settings, seller: null, listings: [] as never[] };

  const seller = await prisma.sellerAccount.findUnique({ where: { slug: params.slug } });
  if (!seller) return { settings, seller: null, listings: [] as never[] };
  if (seller.sharingStatus !== "ENABLED") return { settings, seller: null, listings: [] as never[] };
  if (settings.securityRequireVerification && !seller.verified) return { settings, seller: null, listings: [] as never[] };

  const listings = await prisma.listing.findMany({
    where: { sellerId: seller.userId, status: "ACTIVE" },
    include: { photos: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return { settings, seller, listings };
}

export async function generateMetadata({
  params,
}: {
  params: { sellerPrefix: string; slug: string };
}): Promise<Metadata> {
  const { settings, seller } = await loadSeller(params);
  if (params.sellerPrefix !== settings.urlPrefix || !settings.enabled || !seller) {
    return { title: "Seller inventory", robots: { index: false, follow: false } };
  }

  const title = `${seller.businessName} · vehicles for sale`;
  const description = seller.description ?? `Browse active vehicle listings from ${seller.businessName}.`;

  return {
    title,
    description,
    robots: { index: settings.seoIndexing, follow: settings.seoIndexing },
    openGraph: settings.seoOpenGraph
      ? { title, description, images: seller.logoUrl ? [seller.logoUrl] : undefined }
      : undefined,
    twitter: settings.seoTwitterCard
      ? { card: "summary_large_image", title, description, images: seller.logoUrl ? [seller.logoUrl] : undefined }
      : undefined,
  };
}

export default async function SellerSharePage({
  params,
}: {
  params: { sellerPrefix: string; slug: string };
}) {
  const { settings, seller, listings } = await loadSeller(params);

  if (params.sellerPrefix !== settings.urlPrefix) notFound();

  if (!settings.enabled) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-ink">Feature Currently Disabled</h1>
        <p className="mt-2 text-gray-600">{settings.disabledMessage}</p>
      </div>
    );
  }

  if (!seller) notFound();

  if (settings.analyticsPageViews) {
    const allowedByRateLimit =
      !settings.securityRateLimitEnabled || checkRateLimit(`seller-share-view:${seller.id}`, settings.securityRateLimitPerMinute);
    if (allowedByRateLimit) {
      prisma.sellerAccount
        .update({ where: { id: seller.id }, data: { shareLinkPageViews: { increment: 1 } } })
        .catch(() => null);
    }
  }

  const siteSettings = await getSiteSettings();
  const initials = seller.businessName
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const shareListings = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    priceMwk: listing.priceMwk,
    year: listing.year,
    mileageKm: listing.mileageKm,
    bodyType: listing.bodyType,
    photoUrl: listing.photos[0]?.url ?? null,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: seller.businessName,
    description: seller.description ?? undefined,
    image: seller.logoUrl ?? undefined,
    address: settings.securityHideLocation ? undefined : seller.district ?? undefined,
    telephone: settings.securityHidePhone ? undefined : seller.callPhoneNumber ?? undefined,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {settings.seoStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand-100">
          {seller.logoUrl ? (
            <Image src={seller.logoUrl} alt={seller.businessName} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-700">
              {initials || "?"}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-ink">{seller.businessName}</h1>
            {seller.verified && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">✓ Verified</span>
            )}
          </div>
          {!settings.securityHideLocation && seller.district && <p className="mt-1 text-sm text-gray-500">{seller.district}</p>}
          <p className="mt-1 text-sm text-gray-500">
            {shareListings.length} active listing{shareListings.length === 1 ? "" : "s"} on {siteSettings.siteName}
          </p>
          {seller.description && <p className="mt-2 text-sm text-gray-700">{seller.description}</p>}
        </div>

        <div className="sm:w-56">
          <SellerShareContactButtons
            slug={seller.slug as string}
            businessName={seller.businessName}
            callPhoneNumber={settings.securityHidePhone ? null : seller.callPhoneNumber}
            whatsappNumber={settings.securityHideWhatsapp ? null : seller.whatsappNumber}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Vehicles for sale</h2>
        {shareListings.length > 0 ? (
          <div className="mt-4">
            <SellerShareListingGrid slug={seller.slug as string} listings={shareListings} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No active listings right now — check back soon.</p>
        )}
      </div>
    </div>
  );
}
