import Link from "next/link";
import { BUDGET_TIERS } from "@/lib/budget";

export default function BudgetShortcuts({
  title = "Popular cars by budget",
  subtitle = "Find vehicles within your price range.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        {BUDGET_TIERS.map((tier) => {
          const params = new URLSearchParams();
          if (tier.minPrice) params.set("minPrice", String(tier.minPrice));
          if (tier.maxPrice) params.set("maxPrice", String(tier.maxPrice));
          return (
            <Link
              key={tier.key}
              href={`/marketplace?${params.toString()}`}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-700 hover:shadow"
            >
              {tier.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
