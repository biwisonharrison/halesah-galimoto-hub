import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildListingOrderBy, buildListingWhere, type MarketplaceSearchParams } from "@/lib/listingFilters";
import ListingCard from "@/components/ListingCard";
import MarketplaceFilters from "@/components/MarketplaceFilters";
import CategoryTabs from "@/components/CategoryTabs";
import Pagination from "@/components/Pagination";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Buy a car · Halesah Galimoto Hub" };

const PAGE_SIZE = 48;

export default async function MarketplacePage({ searchParams }: { searchParams: MarketplaceSearchParams }) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const where = buildListingWhere(searchParams);

  const [listings, totalCount, districts] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: buildListingOrderBy(searchParams.sort),
      include: { district: true, photos: true, seller: { select: { phone: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (searchParams.q) {
    logSearch(searchParams.q, totalCount).catch(() => null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold text-ink">Buy a car</h1>
        <Link href="/sell" className="text-sm font-medium text-brand-700 hover:underline">
          Sell your car →
        </Link>
      </div>

      <div className="mt-4">
        <CategoryTabs current={searchParams} />
      </div>

      <div className="mt-6">
        <MarketplaceFilters districts={districts} searchParams={searchParams} />
      </div>

      <p className="mt-6 text-sm text-gray-500">
        {totalCount} car{totalCount === 1 ? "" : "s"} found
        {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
      </p>

      {listings.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination basePath="/marketplace" current={searchParams} page={page} totalPages={totalPages} />
        </>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          No cars match those filters yet. Try widening your search, or check back soon.
        </div>
      )}
    </div>
  );
}

async function logSearch(query: string, resultsCount: number) {
  const user = await getCurrentUser();
  await prisma.searchLog.create({
    data: { query, resultsCount, userId: user?.id },
  });
}
