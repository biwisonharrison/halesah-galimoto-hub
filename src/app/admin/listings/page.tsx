import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMWK, timeAgo } from "@/lib/format";
import AdminListingActions from "@/components/AdminListingActions";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-brand-100 text-brand-800",
  SOLD: "bg-gray-200 text-gray-700",
  HIDDEN: "bg-gray-200 text-gray-700",
  PENDING_DELETION: "bg-red-100 text-red-700",
  DELETED: "bg-red-100 text-red-700",
  EXPIRED: "bg-amber-100 text-amber-800",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function AdminListingsPage() {
  const [pending, listings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: { seller: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.listing.findMany({
      include: { seller: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Pending approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Nothing waiting for review.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {pending.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-ink">All listings ({listings.length})</h2>
      <div className="mt-4 space-y-3">
        {listings.map((listing) => (
          <ListingRow key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

function ListingRow({
  listing,
}: {
  listing: {
    id: string;
    title: string;
    priceMwk: number;
    createdAt: Date;
    status: string;
    featured: boolean;
    seller: { name: string | null; phone: string };
  };
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <Link href={`/marketplace/${listing.id}`} className="font-semibold text-ink hover:underline">
          {listing.title}
        </Link>
        <p className="text-sm text-gray-500">
          {formatMWK(listing.priceMwk)} · {listing.seller.name ?? listing.seller.phone} · {timeAgo(listing.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[listing.status]}`}>
          {listing.status.replace(/_/g, " ")}
        </span>
        <AdminListingActions listingId={listing.id} status={listing.status} featured={listing.featured} />
      </div>
    </div>
  );
}
