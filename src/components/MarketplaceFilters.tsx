import Link from "next/link";
import type { District } from "@prisma/client";
import type { MarketplaceSearchParams } from "@/lib/listingFilters";
import { BUDGET_TIERS } from "@/lib/budget";
import { buildQueryHref, toggleValue } from "@/lib/query";
import FilterChipGroup from "./FilterChipGroup";

const BODY_TYPES = [
  { value: "SUV", label: "SUV" },
  { value: "HATCHBACK", label: "Hatchback" },
  { value: "SEDAN", label: "Sedan" },
  { value: "PICKUP", label: "Pickup" },
  { value: "VAN", label: "Van" },
  { value: "WAGON", label: "Station Wagon" },
  { value: "COUPE", label: "Coupe" },
];

const FUEL_TYPES = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "HYBRID", label: "Hybrid" },
];

const TRANSMISSIONS = [
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "MANUAL", label: "Manual" },
];

const SEATING = [
  { value: "2", label: "2 Seater" },
  { value: "4", label: "4 Seater" },
  { value: "5", label: "5 Seater" },
  { value: "7", label: "7 Seater" },
  { value: "8+", label: "8+ Seater" },
];

const DRIVE_TYPES = [
  { value: "TWO_WD", label: "2WD" },
  { value: "FOUR_WD", label: "4WD" },
  { value: "AWD", label: "AWD" },
];

const VEHICLE_CONDITIONS = [
  { value: "NEW", label: "Brand New" },
  { value: "FOREIGN_USED", label: "Foreign Used" },
  { value: "LOCALLY_USED", label: "Locally Used" },
  { value: "FOR_PARTS", label: "For Parts / Breaking" },
];

const SELLER_TYPES = [
  { value: "PRIVATE", label: "Private seller" },
  { value: "DEALER", label: "Dealer" },
];

export default function MarketplaceFilters({
  districts,
  searchParams,
}: {
  districts: District[];
  searchParams: MarketplaceSearchParams;
}) {
  const hasActiveFilters = Object.entries(searchParams).some(([key, value]) => key !== "sort" && Boolean(value));

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          name="q"
          placeholder="Search brand, model…"
          defaultValue={searchParams.q}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 lg:col-span-2"
        />
        <select name="district" defaultValue={searchParams.district ?? ""} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Any district</option>
          {districts.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={searchParams.sort ?? "newest"} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="cheapest">Cheapest</option>
          <option value="most-viewed">Most viewed</option>
        </select>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 lg:col-span-4">
          Apply search
        </button>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-ink">Budget</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {BUDGET_TIERS.map((tier) => {
            const isActive = searchParams.minPrice === (tier.minPrice ? String(tier.minPrice) : undefined) &&
              searchParams.maxPrice === (tier.maxPrice ? String(tier.maxPrice) : undefined) &&
              (tier.minPrice !== undefined || tier.maxPrice !== undefined);
            const href = isActive
              ? buildQueryHref("/marketplace", searchParams, { minPrice: undefined, maxPrice: undefined })
              : buildQueryHref("/marketplace", searchParams, {
                  minPrice: tier.minPrice ? String(tier.minPrice) : undefined,
                  maxPrice: tier.maxPrice ? String(tier.maxPrice) : undefined,
                });
            return (
              <Link
                key={tier.key}
                href={href}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700"
                }`}
              >
                {tier.label}
              </Link>
            );
          })}
        </div>
      </div>

      <FilterChipGroup title="Body type" paramKey="bodyType" options={BODY_TYPES} current={searchParams} />
      <FilterChipGroup title="Fuel type" paramKey="fuelType" options={FUEL_TYPES} current={searchParams} />
      <FilterChipGroup title="Transmission" paramKey="transmission" options={TRANSMISSIONS} current={searchParams} />
      <FilterChipGroup title="Seating capacity" paramKey="seating" options={SEATING} current={searchParams} />
      <FilterChipGroup title="Drive type (optional)" paramKey="drivetrain" options={DRIVE_TYPES} current={searchParams} />
      <FilterChipGroup title="Vehicle condition" paramKey="condition" options={VEHICLE_CONDITIONS} current={searchParams} />
      <FilterChipGroup title="Seller type" paramKey="sellerType" options={SELLER_TYPES} current={searchParams} />

      {hasActiveFilters && (
        <Link href="/marketplace" className="inline-block text-sm font-medium text-gray-500 hover:text-ink hover:underline">
          Clear all filters
        </Link>
      )}
    </div>
  );
}
