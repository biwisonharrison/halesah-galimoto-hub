import Link from "next/link";
import { buildQueryHref, toggleValue, type QueryParams } from "@/lib/query";

const TABS = [
  { value: "new", label: "New Cars" },
  { value: "used", label: "Used Cars" },
  { value: "FOR_PARTS", label: "For Parts / Breaking" },
];

export default function CategoryTabs({
  current,
  basePath = "/marketplace",
}: {
  current: QueryParams;
  basePath?: string;
}) {
  return (
    <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
      {TABS.map((tab) => {
        const isActive = current.condition === tab.value;
        const href = buildQueryHref(basePath, current, { condition: toggleValue(current, "condition", tab.value) });
        return (
          <Link
            key={tab.value}
            href={href}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              isActive ? "bg-ink text-white" : "text-gray-600 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
