import Link from "next/link";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface BrandTile {
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export default function BrandGrid({
  brands,
  title = "Browse by brand",
  subtitle = "All the car brands available on Halesah Galimoto Hub.",
  ctaLabel = "Full brand catalogue",
  ctaHref = "/brands",
}: {
  brands: BrandTile[];
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <Link href={ctaHref} className="text-sm font-medium text-brand-700 hover:underline">
          {ctaLabel} →
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/marketplace?brand=${encodeURIComponent(brand.name)}`}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative flex h-16 w-full items-center justify-center bg-white p-2">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <PhotoPlaceholder seed={brand.slug} label={brand.name} />
              )}
            </div>
            <p className="px-2 py-2 text-center text-xs font-medium text-ink">{brand.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
