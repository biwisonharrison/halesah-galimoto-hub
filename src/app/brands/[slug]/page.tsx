import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";

export default async function BrandProfilePage({ params }: { params: { slug: string } }) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
    include: { models: { orderBy: { yearStart: "asc" } } },
  });
  if (!brand) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm text-gray-500">
        <Link href="/brands" className="hover:underline">
          Brand catalogue
        </Link>
      </p>

      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <PhotoPlaceholder seed={brand.slug} label={brand.name.slice(0, 2).toUpperCase()} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink">{brand.name}</h1>
          <p className="text-sm text-gray-500">Origin: {brand.originCountry}</p>
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-gray-700">{brand.history}</p>

      <h2 className="mt-10 text-lg font-semibold text-ink">Model timeline</h2>
      <div className="mt-4 space-y-3">
        {brand.models.map((model) => (
          <Link
            key={model.id}
            href={`/brands/${brand.slug}/${model.slug}`}
            className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <h3 className="font-semibold text-ink">
                {model.name}{" "}
                {model.isClassic && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Classic
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1">{model.description}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-gray-500">
              {model.yearStart} {model.yearEnd ? `to ${model.yearEnd}` : "to present"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
