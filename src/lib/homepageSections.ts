import "server-only";
import { prisma } from "@/lib/prisma";
import type { HomepageSection } from "@prisma/client";

export const HOMEPAGE_SECTION_DEFAULTS: Record<
  string,
  { sortOrder: number; title: string; subtitle: string; ctaLabel: string | null; ctaHref: string | null; locked?: boolean }
> = {
  hero: {
    sortOrder: 0,
    title: "Malawi's online home for cars, kuyambira Karonga mpaka Nsanje",
    subtitle: "Look up any model and its fair Malawian price, buy from verified sellers, or list your own car in under 5 minutes, from any phone.",
    ctaLabel: null,
    ctaHref: null,
    locked: true,
  },
  featured: {
    sortOrder: 1,
    title: "Featured listings",
    subtitle: "",
    ctaLabel: "See all listings",
    ctaHref: "/marketplace",
  },
  budget: {
    sortOrder: 2,
    title: "Popular cars by budget",
    subtitle: "Find vehicles within your price range.",
    ctaLabel: null,
    ctaHref: null,
  },
  brands: {
    sortOrder: 3,
    title: "Browse by brand",
    subtitle: "All the car brands available on Halesah Galimoto Hub.",
    ctaLabel: "Full brand catalogue",
    ctaHref: "/brands",
  },
  reviews: {
    sortOrder: 4,
    title: "What our customers say",
    subtitle: "Real feedback from buyers and sellers on Halesah Galimoto Hub.",
    ctaLabel: "View all reviews",
    ctaHref: "/reviews",
  },
};

/** Fetches all homepage sections, creating any missing default rows on first use. */
export async function getHomepageSections(): Promise<HomepageSection[]> {
  const existing = await prisma.homepageSection.findMany();
  const existingKeys = new Set(existing.map((s) => s.key));
  const missing = Object.entries(HOMEPAGE_SECTION_DEFAULTS).filter(([key]) => !existingKeys.has(key));

  if (missing.length > 0) {
    await prisma.homepageSection.createMany({
      data: missing.map(([key, def]) => ({
        key,
        sortOrder: def.sortOrder,
        title: def.title,
        subtitle: def.subtitle,
        ctaLabel: def.ctaLabel,
        ctaHref: def.ctaHref,
      })),
      skipDuplicates: true,
    });
  }

  return prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function updateHomepageSection(
  id: string,
  data: Partial<Pick<HomepageSection, "enabled" | "title" | "subtitle" | "ctaLabel" | "ctaHref">>
): Promise<HomepageSection> {
  return prisma.homepageSection.update({ where: { id }, data });
}

export async function moveHomepageSection(id: string, direction: "up" | "down"): Promise<void> {
  const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  const index = sections.findIndex((s) => s.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sections.length) return;

  const current = sections[index];
  const swapWith = sections[swapIndex];

  await prisma.$transaction([
    prisma.homepageSection.update({ where: { id: current.id }, data: { sortOrder: swapWith.sortOrder } }),
    prisma.homepageSection.update({ where: { id: swapWith.id }, data: { sortOrder: current.sortOrder } }),
  ]);
}
