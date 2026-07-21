import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";

export const metadata = { title: "Brand catalogue · Halesah Galimoto Hub" };

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { models: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Brand catalogue</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            An A to Z directory of every major brand on Malawian roads, including vintage and discontinued models.
          </p>
        </div>
        <Link href="/classics" className="hidden shrink-0 text-sm font-medium text-brand-700 hover:underline sm:block">
          Classic car gallery →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative flex h-24 w-full items-center justify-center bg-white p-3">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <PhotoPlaceholder seed={brand.slug} label={brand.name} />
              )}
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-ink">{brand.name}</h2>
              <p className="text-xs text-gray-500">{brand._count.models} models catalogued</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
