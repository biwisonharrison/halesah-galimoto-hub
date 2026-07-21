import Link from "next/link";
import { buildQueryHref, type QueryParams } from "@/lib/query";

function pageWindow(current: number, total: number): (number | "…")[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}

const THEME = {
  light: {
    edge: "border-gray-300 text-ink hover:bg-gray-50",
    edgeDisabled: "border-gray-100 text-gray-300",
    active: "bg-ink text-white",
    inactive: "text-gray-600 hover:bg-gray-100",
    ellipsis: "text-gray-400",
  },
  dark: {
    edge: "border-gray-700 text-gray-200 hover:bg-gray-800",
    edgeDisabled: "border-gray-800 text-gray-600",
    active: "bg-emerald-500 text-gray-950",
    inactive: "text-gray-300 hover:bg-gray-800",
    ellipsis: "text-gray-600",
  },
} as const;

export default function Pagination({
  basePath,
  current,
  page,
  totalPages,
  variant = "light",
}: {
  basePath: string;
  current: QueryParams;
  page: number;
  totalPages: number;
  variant?: "light" | "dark";
}) {
  if (totalPages <= 1) return null;
  const t = THEME[variant];

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={buildQueryHref(basePath, current, { page: page > 1 ? String(page - 1) : undefined })}
        aria-disabled={page <= 1}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${page <= 1 ? `pointer-events-none ${t.edgeDisabled}` : t.edge}`}
      >
        ← Prev
      </Link>

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className={`px-2 text-sm ${t.ellipsis}`}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildQueryHref(basePath, current, { page: p === 1 ? undefined : String(p) })}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${p === page ? t.active : t.inactive}`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildQueryHref(basePath, current, { page: page < totalPages ? String(page + 1) : undefined })}
        aria-disabled={page >= totalPages}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${page >= totalPages ? `pointer-events-none ${t.edgeDisabled}` : t.edge}`}
      >
        Next →
      </Link>
    </nav>
  );
}
