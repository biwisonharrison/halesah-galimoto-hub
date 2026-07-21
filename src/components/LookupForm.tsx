"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Brand = { slug: string; name: string };
type Model = { slug: string; name: string; yearStart: number; yearEnd: number | null };

export default function LookupForm({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [brandSlug, setBrandSlug] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [modelSlug, setModelSlug] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (!brandSlug) {
      setModels([]);
      setModelSlug("");
      return;
    }
    fetch(`/api/brands/${brandSlug}/models`)
      .then((res) => res.json())
      .then((data) => setModels(data.models ?? []));
  }, [brandSlug]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brandSlug || !modelSlug) return;
    const params = new URLSearchParams({ brand: brandSlug, model: modelSlug });
    if (year) params.set("year", year);
    router.push(`/lookup/results?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-4">
      <select
        required
        value={brandSlug}
        onChange={(e) => setBrandSlug(e.target.value)}
        className="rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        <option value="">Brand…</option>
        {brands.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.name}
          </option>
        ))}
      </select>

      <select
        required
        disabled={!brandSlug}
        value={modelSlug}
        onChange={(e) => setModelSlug(e.target.value)}
        className="rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-gray-50"
      >
        <option value="">Model…</option>
        {models.map((m) => (
          <option key={m.slug} value={m.slug}>
            {m.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Year (optional)"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />

      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Look up
      </button>
    </form>
  );
}
