import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { HomepageSection } from "@prisma/client";
import ListingCard from "@/components/ListingCard";
import CategoryTabs from "@/components/CategoryTabs";
import BudgetShortcuts from "@/components/BudgetShortcuts";
import BrandGrid from "@/components/BrandGrid";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import { getHomepageSections, HOMEPAGE_SECTION_DEFAULTS } from "@/lib/homepageSections";

async function getHomeData() {
  const [featuredListings, districts, brands, sections, reviews] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE", featured: true },
      include: {
        district: true,
        photos: true,
        seller: { select: { phone: true, sellerAccount: { select: { whatsappNumber: true, callPhoneNumber: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    getHomepageSections(),
    prisma.review.findMany({
      where: { status: "APPROVED" },
      include: { author: { select: { name: true } }, subject: { select: { name: true, sellerAccount: { select: { businessName: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const testimonials = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    authorName: r.displayAnonymously ? "Anonymous" : r.author.name ?? "Anonymous",
    sellerName: r.subject ? r.subject.sellerAccount?.businessName ?? r.subject.name ?? null : null,
  }));

  const sectionMap = new Map(sections.map((s) => [s.key, s]));
  const orderedKeys = ["featured", "budget", "brands", "reviews"].filter((key) => {
    if (key === "reviews" && testimonials.length === 0) return false;
    const section = sectionMap.get(key);
    return !section || section.enabled;
  });
  orderedKeys.sort((a, b) => (sectionMap.get(a)?.sortOrder ?? 0) - (sectionMap.get(b)?.sortOrder ?? 0));

  return { featuredListings, districts, brands, sectionMap, orderedKeys, testimonials };
}

function sectionText(sectionMap: Map<string, HomepageSection>, key: string) {
  const section = sectionMap.get(key);
  const fallback = HOMEPAGE_SECTION_DEFAULTS[key];
  return {
    title: section?.title ?? fallback.title,
    subtitle: section?.subtitle ?? fallback.subtitle,
    ctaLabel: section?.ctaLabel ?? fallback.ctaLabel ?? "",
    ctaHref: section?.ctaHref ?? fallback.ctaHref ?? "#",
  };
}

export default async function HomePage() {
  const { featuredListings, districts, brands, sectionMap, orderedKeys, testimonials } = await getHomeData();
  const hero = sectionText(sectionMap, "hero");

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    featured: () => {
      const text = sectionText(sectionMap, "featured");
      return (
        <section key="featured" className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-ink">{text.title}</h2>
            <Link href={text.ctaHref} className="text-sm font-medium text-brand-700 hover:underline">
              {text.ctaLabel} →
            </Link>
          </div>
          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No featured listings yet. Be the first to{" "}
              <Link href="/sell" className="font-medium text-brand-700 underline">
                list your car
              </Link>
              .
            </p>
          )}
        </section>
      );
    },
    budget: () => {
      const text = sectionText(sectionMap, "budget");
      return <BudgetShortcuts key="budget" title={text.title} subtitle={text.subtitle} />;
    },
    brands: () => {
      const text = sectionText(sectionMap, "brands");
      return (
        <div key="brands" className="hidden sm:block">
          <BrandGrid
            brands={brands.map((b) => ({ slug: b.slug, name: b.name, logoUrl: b.logoUrl }))}
            title={text.title}
            subtitle={text.subtitle}
            ctaLabel={text.ctaLabel}
            ctaHref={text.ctaHref}
          />
        </div>
      );
    },
    reviews: () => {
      const text = sectionText(sectionMap, "reviews");
      return (
        <section key="reviews" className="mx-auto hidden max-w-6xl px-4 py-12 sm:block">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-ink">{text.title}</h2>
            {text.subtitle && <p className="mt-1 text-gray-600">{text.subtitle}</p>}
          </div>
          <ReviewsCarousel reviews={testimonials} />
          <div className="mt-6 text-center">
            <Link href={text.ctaHref} className="text-sm font-medium text-brand-700 hover:underline">
              {text.ctaLabel} →
            </Link>
          </div>
        </section>
      );
    },
  };

  return (
    <div>
      <section className="bg-gradient-to-b from-ink to-ink/90 px-4 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            Mtsika wa Magalimoto · Malawi
          </p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{hero.title}</h1>
          <p className="mt-4 text-lg text-white/80">{hero.subtitle}</p>

          <form action="/marketplace" className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              name="q"
              type="text"
              placeholder="Search a brand or model…"
              className="w-full rounded-lg border-0 px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {districts.map((d) => (
              <Link
                key={d.id}
                href={`/marketplace?district=${encodeURIComponent(d.name)}`}
                className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90 hover:bg-white/20"
              >
                {d.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/marketplace" className="rounded-lg bg-white px-5 py-2.5 font-semibold text-ink hover:bg-white/90">
              Buy a car
            </Link>
            <Link
              href="/sell"
              className="rounded-lg bg-brand-500 px-5 py-2.5 font-semibold text-white hover:bg-brand-600"
            >
              Sell your car
            </Link>
            <Link
              href="/brands"
              className="rounded-lg border border-white/40 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
            >
              Explore brands
            </Link>
            <Link
              href="/lookup"
              className="rounded-lg border border-white/40 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
            >
              Car lookup
            </Link>
          </div>

          <div className="mt-8 flex justify-center">
            <CategoryTabs current={{}} />
          </div>
        </div>
      </section>

      {orderedKeys.map((key) => sectionRenderers[key]())}
    </div>
  );
}
