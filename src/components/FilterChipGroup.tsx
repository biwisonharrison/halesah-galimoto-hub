import Link from "next/link";
import { buildQueryHref, toggleValue, type QueryParams } from "@/lib/query";

interface ChipOption {
  value: string;
  label: string;
}

export default function FilterChipGroup({
  title,
  paramKey,
  options,
  current,
  basePath = "/marketplace",
}: {
  title: string;
  paramKey: string;
  options: ChipOption[];
  current: QueryParams;
  basePath?: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = current[paramKey] === opt.value;
          const href = buildQueryHref(basePath, current, { [paramKey]: toggleValue(current, paramKey, opt.value) });
          return (
            <Link
              key={opt.value}
              href={href}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
