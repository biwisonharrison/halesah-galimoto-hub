"use client";

import Link from "next/link";
import Image from "next/image";
import CarIllustration from "./CarIllustration";
import { formatMWK, formatMileage } from "@/lib/format";
import { trackSellerShareEvent } from "@/lib/sellerShareTrack";

export interface SellerShareListing {
  id: string;
  title: string;
  priceMwk: number;
  year: number;
  mileageKm: number;
  bodyType: string | null;
  photoUrl: string | null;
}

export default function SellerShareListingGrid({ slug, listings }: { slug: string; listings: SellerShareListing[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/marketplace/${listing.id}`}
          onClick={() => trackSellerShareEvent(slug, "listing_click")}
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
            {listing.photoUrl ? (
              <Image
                src={listing.photoUrl}
                alt={listing.title}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition group-hover:scale-105"
              />
            ) : (
              <CarIllustration bodyType={listing.bodyType} seed={listing.id} label={listing.title} />
            )}
          </div>
          <div className="p-3">
            <p className="line-clamp-1 text-sm font-semibold text-ink">{listing.title}</p>
            <p className="mt-0.5 text-base font-bold text-brand-700">{formatMWK(listing.priceMwk)}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {listing.year} · {formatMileage(listing.mileageKm)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
