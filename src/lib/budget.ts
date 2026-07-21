export interface BudgetTier {
  key: string;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

export const BUDGET_TIERS: BudgetTier[] = [
  { key: "under-5m", label: "Under MK 5 Million", maxPrice: 5_000_000 },
  { key: "under-10m", label: "Under MK 10 Million", maxPrice: 10_000_000 },
  { key: "under-20m", label: "Under MK 20 Million", maxPrice: 20_000_000 },
  { key: "under-30m", label: "Under MK 30 Million", maxPrice: 30_000_000 },
  { key: "under-50m", label: "Under MK 50 Million", maxPrice: 50_000_000 },
  { key: "above-50m", label: "Above MK 50 Million", minPrice: 50_000_000 },
];
