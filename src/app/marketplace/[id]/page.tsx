import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMWK, formatMileage, timeAgo } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";
import ListingActions from "@/components/ListingActions";
import ListingGallery from "@/components/ListingGallery";

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

const DRIVETRAIN_LABELS: Record<string, string> = {
  TWO_WD: "2WD",
  FOUR_WD: "4WD",
  AWD: "AWD",
};

const SALE_CONDITION_LABELS: Record<string, string> = {
  NEW: "Brand New",
  FOREIGN_USED: "Foreign Used",
  LOCALLY_USED: "Locally Used",
  FOR_PARTS: "For Parts / Breaking",
};

const SALE_CONDITION_STYLES: Record<string, string> = {
  NEW: "bg-brand-600 text-white",
  FOREIGN_USED: "bg-ink/10 text-ink",
  LOCALLY_USED: "bg-amber-100 text-amber-800",
  FOR_PARTS: "bg-red-100 text-red-700",
};

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      district: true,
      photos: { orderBy: { position: "asc" } },
      seller: { include: { sellerAccount: true } },
      carModel: { include: { brand: true } },
    },
  });
  if (!listing) notFound();

  await prisma.listing.update({ where: { id: listing.id }, data: { viewCount: { increment: 1 } } }).catch(() => null);

  const [user, priceContext] = await Promise.all([
    getCurrentUser(),
    listing.carModelId
      ? prisma.listing.aggregate({
          where: { carModelId: listing.carModelId, status: "ACTIVE", id: { not: listing.id } },
          _min: { priceMwk: true },
          _max: { priceMwk: true },
          _count: true,
        })
      : null,
  ]);

  const alreadyFavorited = user
    ? Boolean(await prisma.favorite.findUnique({ where: { userId_listingId: { userId: user.id, listingId: listing.id } } }))
    : false;

  const isVerifiedSeller = Boolean(listing.seller.phoneVerifiedAt);
  const isRegisteredDealer = Boolean(listing.seller.sellerAccount?.verified);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm text-gray-500">
        <Link href="/marketplace" className="hover:underline">
          Buy a car
        </Link>
      </p>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListingGallery
            photos={listing.photos}
            featured={listing.featured}
            fallbackBodyType={listing.bodyType}
            fallbackSeed={listing.id}
            fallbackLabel={`${listing.brandName} ${listing.modelName}`}
          />

          {listing.videoUrl && (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-ink">Walkaround video</h2>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={listing.videoUrl} controls className="w-full rounded-2xl bg-black" />
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SALE_CONDITION_STYLES[listing.saleCondition]}`}>
              {SALE_CONDITION_LABELS[listing.saleCondition]}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-ink">{listing.title}</h1>
          <p className="mt-1 text-3xl font-extrabold text-brand-700">{formatMWK(listing.priceMwk)}</p>

          {priceContext && priceContext._count > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Similar {listing.modelName}s are listed between {formatMWK(priceContext._min.priceMwk ?? 0)} and{" "}
              {formatMWK(priceContext._max.priceMwk ?? 0)} right now.
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-sm sm:grid-cols-3">
            <Spec label="Year" value={String(listing.year)} />
            <Spec label="Mileage" value={formatMileage(listing.mileageKm)} />
            <Spec label="Transmission" value={listing.transmission} />
            <Spec label="Fuel" value={listing.fuelType ?? "Not specified"} />
            <Spec label="Body type" value={listing.bodyType ? BODY_LABELS[listing.bodyType] ?? listing.bodyType : "Not specified"} />
            <Spec label="Engine size" value={listing.engineCc ? `${listing.engineCc} cc` : "Not specified"} />
            <Spec label="Seating" value={listing.seating ? `${listing.seating} seats` : "Not specified"} />
            <Spec label="Drive type" value={listing.drivetrain ? DRIVETRAIN_LABELS[listing.drivetrain] : "Not specified"} />
            <Spec label="Condition rating" value={listing.condition} />
            <Spec label="District" value={listing.district?.name ?? "Not specified"} />
            <Spec label="Listed" value={timeAgo(listing.createdAt)} />
            <Spec label="Views" value={String(listing.viewCount)} />
          </dl>

          {listing.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-ink">Seller description</h2>
              <p className="mt-2 text-gray-700">{listing.description}</p>
            </div>
          )}

          {listing.carModel && (
            <Link
              href={`/lookup/results?brand=${listing.carModel.brand.slug}&model=${listing.carModel.slug}`}
              className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline"
            >
              See full {listing.brandName} {listing.modelName} specs & history →
            </Link>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Seller</p>
            <p className="mt-1 font-semibold text-ink">
              {listing.seller.sellerAccount?.businessName ?? listing.seller.name ?? "Private seller"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {isVerifiedSeller && (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                  ✓ Verified seller
                </span>
              )}
              {isRegisteredDealer && (
                <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink">
                  Registered dealer
                </span>
              )}
              {listing.sellerType === "PRIVATE" && !isVerifiedSeller && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Unverified, meet safely
                </span>
              )}
            </div>
          </div>

          <ListingActions
            listingId={listing.id}
            isLoggedIn={Boolean(user)}
            initiallyFavorited={alreadyFavorited}
            sellerPhone={listing.seller.phone}
          />

          <Link href="/safety-guide" className="block text-center text-xs text-gray-400 hover:text-gray-600 hover:underline">
            Read the safety guide before you buy
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
