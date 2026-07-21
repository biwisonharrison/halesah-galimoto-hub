"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMWK } from "@/lib/format";

type Plan = { id: string; name: string; priceMwk: number; durationDays: number; isActive: boolean };

export default function AdminPlans({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        priceMwk: Number(form.get("priceMwk")),
        durationDays: Number(form.get("durationDays")),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    e.currentTarget.reset();
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    setBusy(true);
    await fetch(`/api/admin/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-3">
        <h3 className="font-semibold text-ink sm:col-span-3">Add a subscription plan</h3>
        {error && <p className="text-sm text-red-700 sm:col-span-3">{error}</p>}
        <input name="name" required placeholder="Plan name (e.g. Monthly)" className={inputClass} />
        <input name="priceMwk" type="number" required placeholder="Price (MWK)" className={inputClass} />
        <input name="durationDays" type="number" required placeholder="Duration (days)" className={inputClass} />
        <button disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-3">
          Add plan
        </button>
      </form>

      <h3 className="mt-8 font-semibold text-ink">Existing plans ({plans.length})</h3>
      <div className="mt-3 space-y-2">
        {plans.map((plan) => (
          <div key={plan.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="font-medium text-ink">{plan.name}</p>
              <p className="text-sm text-gray-500">{formatMWK(plan.priceMwk)} / {plan.durationDays} days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.isActive ? "bg-brand-100 text-brand-800" : "bg-gray-200 text-gray-600"}`}>
                {plan.isActive ? "Active" : "Inactive"}
              </span>
              <button disabled={busy} onClick={() => toggleActive(plan.id, plan.isActive)} className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
                {plan.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
