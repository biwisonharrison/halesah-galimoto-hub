"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Brand = { id: string; name: string };

const BODY_TYPES = ["SEDAN", "HATCHBACK", "SUV", "PICKUP", "VAN", "MINIBUS", "WAGON", "COUPE", "TRUCK", "MOTORCYCLE"];
const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];
const DRIVETRAINS = ["TWO_WD", "FOUR_WD", "AWD"];

export default function AdminCatalogueForms({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleAddBrand(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        originCountry: form.get("originCountry"),
        history: form.get("history"),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    e.currentTarget.reset();
    router.refresh();
  }

  async function handleAddModel(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const yearEnd = form.get("yearEnd");
    const engineCc = form.get("engineCc");
    const seating = form.get("seating");
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId: form.get("brandId"),
        name: form.get("name"),
        yearStart: Number(form.get("yearStart")),
        yearEnd: yearEnd ? Number(yearEnd) : undefined,
        bodyType: form.get("bodyType"),
        fuelType: form.get("fuelType"),
        drivetrain: form.get("drivetrain"),
        engineCc: engineCc ? Number(engineCc) : undefined,
        seating: seating ? Number(seating) : undefined,
        description: form.get("description") || undefined,
        isClassic: form.get("isClassic") === "on",
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {error && <p className="lg:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleAddBrand} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="font-semibold text-ink">Add a brand</h3>
        <input name="name" required placeholder="Brand name" className={inputClass} />
        <input name="originCountry" required placeholder="Origin country" className={inputClass} />
        <textarea name="history" required placeholder="Brand history" rows={3} className={inputClass} />
        <button disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          Add brand
        </button>
      </form>

      <form onSubmit={handleAddModel} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="font-semibold text-ink">Add a model</h3>
        <select name="brandId" required className={inputClass}>
          <option value="">Select brand…</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input name="name" required placeholder="Model name" className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <input name="yearStart" type="number" required placeholder="Year start" className={inputClass} />
          <input name="yearEnd" type="number" placeholder="Year end (optional)" className={inputClass} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <select name="bodyType" required className={inputClass}>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select name="fuelType" required className={inputClass}>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select name="drivetrain" required className={inputClass}>
            {DRIVETRAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="engineCc" type="number" placeholder="Engine cc (optional)" className={inputClass} />
          <input name="seating" type="number" placeholder="Seating (optional)" className={inputClass} />
        </div>
        <textarea name="description" placeholder="Description" rows={2} className={inputClass} />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="isClassic" /> Classic model
        </label>
        <button disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          Add model
        </button>
      </form>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
