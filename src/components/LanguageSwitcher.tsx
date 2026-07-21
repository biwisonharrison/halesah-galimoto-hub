"use client";

import { useRouter } from "next/navigation";
import { LANG_COOKIE, type Lang } from "@/lib/i18n-shared";

const OPTIONS: { value: Lang; flag: string; label: string }[] = [
  { value: "en", flag: "🇬🇧", label: "English" },
  { value: "ny", flag: "🇲🇼", label: "Chichewa (Chinyanja)" },
  { value: "both", flag: "🌍", label: "English & Chichewa (Bilingual)" },
];

export default function LanguageSwitcher({ current, title }: { current: Lang; title: string }) {
  const router = useRouter();

  function selectLanguage(value: Lang) {
    document.cookie = `${LANG_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <div>
      <h3 className="mb-3 font-semibold text-ink">{title}</h3>
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => selectLanguage(opt.value)}
            aria-pressed={current === opt.value}
            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-sm transition ${
              current === opt.value
                ? "border-brand-500 bg-brand-50 font-semibold text-brand-800"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span aria-hidden="true">{opt.flag}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
