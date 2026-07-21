export type QueryParams = Record<string, string | undefined>;

/**
 * Builds a "/marketplace?..." href by merging `updates` into `current`.
 * Any key set to undefined in `updates` is removed from the result, so chip
 * links can toggle a filter off by passing the same value that's already active.
 */
export function buildQueryHref(base: string, current: QueryParams, updates: QueryParams): string {
  const merged: QueryParams = { ...current, ...updates };
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Toggle helper: if `current[key] === value`, the filter is cleared; otherwise it's set. */
export function toggleValue(current: QueryParams, key: string, value: string): string | undefined {
  return current[key] === value ? undefined : value;
}
