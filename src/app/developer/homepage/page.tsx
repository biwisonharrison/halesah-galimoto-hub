import { getHomepageSections, HOMEPAGE_SECTION_DEFAULTS } from "@/lib/homepageSections";
import HomepageSectionsEditor from "@/components/developer/HomepageSectionsEditor";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero (top banner)",
  featured: "Featured listings",
  budget: "Popular cars by budget",
  brands: "Browse by brand",
};

export default async function HomepageSectionsPage() {
  const sections = (await getHomepageSections()).filter((s) => s.key in HOMEPAGE_SECTION_DEFAULTS);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Homepage sections</h1>
      <p className="mt-1 text-sm text-gray-400">
        Toggle sections on or off, reorder them, and edit their headline text. The hero banner always stays at the
        top since it carries the main search bar.
      </p>

      <div className="mt-6">
        <HomepageSectionsEditor
          sections={sections.map((s) => ({
            id: s.id,
            key: s.key,
            label: SECTION_LABELS[s.key] ?? s.key,
            enabled: s.enabled,
            title: s.title ?? "",
            subtitle: s.subtitle ?? "",
            ctaLabel: s.ctaLabel,
            ctaHref: s.ctaHref,
            locked: s.key === "hero",
          }))}
        />
      </div>
    </div>
  );
}
