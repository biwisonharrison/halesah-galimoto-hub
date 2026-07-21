import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma, ListingStatus } from "@prisma/client";
import VehicleTable from "@/components/developer/VehicleTable";
import Pagination from "@/components/Pagination";

const STATUS_OPTIONS = [
  "DRAFT",
  "PENDING_APPROVAL",
  "ACTIVE",
  "RESERVED",
  "SOLD",
  "HIDDEN",
  "ARCHIVED",
  "PENDING_DELETION",
  "REJECTED",
  "EXPIRED",
  "DELETED",
];

const PAGE_SIZE = 50;

interface VehiclesSearchParams {
  [key: string]: string | undefined;
  status?: string;
  q?: string;
  page?: string;
}

export default async function DeveloperVehiclesPage({ searchParams }: { searchParams: VehiclesSearchParams }) {
  const where: Prisma.ListingWhereInput = {};
  if (searchParams.status) where.status = searchParams.status as ListingStatus;
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { brandName: { contains: searchParams.q, mode: "insensitive" } },
      { modelName: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }

  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { seller: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vehicles</h1>
          <p className="mt-1 text-sm text-gray-400">
            {totalCount} listing(s) match this view{totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}.
          </p>
        </div>
        <Link href="/sell" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400">
          + Add vehicle
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search title, brand, or model…"
          className="w-64 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        />
        <select name="status" defaultValue={searchParams.status ?? ""} className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800">
          Filter
        </button>
      </form>

      <div className="mt-6">
        <VehicleTable
          listings={listings.map((l) => ({
            id: l.id,
            title: l.title,
            priceMwk: l.priceMwk,
            status: l.status,
            featured: l.featured,
            createdAt: l.createdAt.toISOString(),
            sellerName: l.seller.name ?? l.seller.phone,
          }))}
        />
        <Pagination basePath="/developer/vehicles" current={searchParams} page={page} totalPages={totalPages} variant="dark" />
      </div>
    </div>
  );
}
