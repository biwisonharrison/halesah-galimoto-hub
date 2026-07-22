import Link from "next/link";
import Image from "next/image";
import type { District, Listing, ListingPhoto } from "@prisma/client";
import { formatMWK, formatMileage, timeAgo } from "@/lib/format";
import CarIllustration from "./CarIllustration";

export type ListingCardData = Listing & {
  district: District | null;
  photos: ListingPhoto[];
  seller: { phone: string; sellerAccount: { whatsappNumber: string | null; callPhoneNumber: string | null } | null };
};

const BODY_LABELS: Record<string, string> = {
  SEDAN: "Sedan",
  HATCHBACK: "Hatchback",
  SUV: "SUV",
  PICKUP: "Pickup",
  VAN: "Van",
  MINIBUS: "Minibus",
  WAGON: "Station Wagon",
  COUPE: "Coupe",
  TRUCK: "Truck",
  MOTORCYCLE: "Motorcycle",
};

export default function ListingCard({ listing }: { listing: ListingCardData }) {
  const photo = listing.photos[0];
  const whatsappNumber = listing.seller.sellerAccount?.whatsappNumber || listing.seller.phone;
  const callPhoneNumber = listing.seller.sellerAccount?.callPhoneNumber || listing.seller.phone;
  const whatsappHref = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(
    `Hi, I saw your ${listing.title} listing on Halesah Galimoto Hub, is it still available?`
  )}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/marketplace/${listing.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {listing.featured && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
              Featured
            </span>
          )}
          {photo ? (
            <Image src={photo.url} alt={listing.title} fill className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" />
          ) : (
            <CarIllustration bodyType={listing.bodyType} seed={listing.id} label={`${listing.brandName} ${listing.modelName}`} />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="line-clamp-1 font-semibold text-ink">{listing.title}</h3>
          <p className="text-lg font-bold text-brand-700">{formatMWK(listing.priceMwk)}</p>
          <p className="text-sm text-gray-500">
            {[String(listing.year), formatMileage(listing.mileageKm), listing.fuelType?.toLowerCase()].filter(Boolean).join(" · ")}
          </p>
          <p className="text-xs text-gray-500">
            {[
              listing.transmission,
              listing.bodyType ? BODY_LABELS[listing.bodyType] ?? listing.bodyType : null,
              listing.engineCc ? `${listing.engineCc}cc` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>{listing.district?.name ?? "Malawi"}</span>
            <span>{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </Link>
      <div className="grid gap-2 border-t border-gray-100 p-3">
        <Link
          href={`/marketplace/${listing.id}`}
          className="rounded-lg border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-ink hover:bg-gray-50"
        >
          View Details
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${callPhoneNumber}`}
            className="rounded-lg border border-gray-300 px-2 py-2 text-center text-xs font-semibold text-ink hover:bg-gray-50"
          >
            Call Seller
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-brand-600 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-brand-700"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
