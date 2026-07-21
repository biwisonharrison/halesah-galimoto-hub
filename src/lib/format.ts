export function formatMWK(amount: number): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: "MWK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat("en-US").format(km)} km`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let value = seconds;
  for (const [size, name] of units) {
    if (value < size) return `${Math.max(1, Math.floor(value))} ${name}${value >= 2 ? "s" : ""} ago`;
    value /= size;
  }
  return "a while ago";
}
