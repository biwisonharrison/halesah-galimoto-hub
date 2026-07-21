"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPES = [
  { value: "STANDARD_BANK", label: "Standard Bank" },
  { value: "NATIONAL_BANK", label: "National Bank" },
  { value: "MPAMBA", label: "Mpamba" },
  { value: "AIRTEL_MONEY", label: "Airtel Money" },
];

type Method = {
  id: string;
  type: string;
  label: string;
  accountName: string | null;
  accountNumber: string | null;
  phoneNumber: string | null;
  instructions: string | null;
  enabled: boolean;
};

export default function AdminPaymentMethods({ methods }: { methods: Method[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState("STANDARD_BANK");

  const isBank = type === "STANDARD_BANK" || type === "NATIONAL_BANK";

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.get("type"),
        label: form.get("label"),
        accountName: form.get("accountName") || undefined,
        accountNumber: form.get("accountNumber") || undefined,
        phoneNumber: form.get("phoneNumber") || undefined,
        instructions: form.get("instructions") || undefined,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    e.currentTarget.reset();
    setType("STANDARD_BANK");
    router.refresh();
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    setBusy(true);
    await fetch(`/api/admin/payment-methods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this payment method?")) return;
    setBusy(true);
    await fetch(`/api/admin/payment-methods/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <h3 className="font-semibold text-ink sm:col-span-2">Add a payment method</h3>
        {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
        <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input name="label" required placeholder="Label (e.g. Main account)" className={inputClass} />
        {isBank ? (
          <>
            <input name="accountName" placeholder="Account name" className={inputClass} />
            <input name="accountNumber" placeholder="Account number" className={inputClass} />
          </>
        ) : (
          <>
            <input name="accountName" placeholder="Registered name" className={inputClass} />
            <input name="phoneNumber" placeholder="Phone number" className={inputClass} />
          </>
        )}
        <textarea name="instructions" placeholder="Extra instructions (optional)" rows={2} className={`${inputClass} sm:col-span-2`} />
        <button disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
          Add payment method
        </button>
      </form>

      <h3 className="mt-8 font-semibold text-ink">Existing payment methods ({methods.length})</h3>
      <div className="mt-3 space-y-2">
        {methods.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {TYPES.find((t) => t.value === m.type)?.label}
              </p>
              <p className="font-medium text-ink">{m.label}</p>
              <p className="text-sm text-gray-500">
                {m.accountName ?? ""} {m.accountNumber ?? m.phoneNumber ?? ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.enabled ? "bg-brand-100 text-brand-800" : "bg-gray-200 text-gray-600"}`}>
                {m.enabled ? "Enabled" : "Disabled"}
              </span>
              <button disabled={busy} onClick={() => toggleEnabled(m.id, m.enabled)} className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
                {m.enabled ? "Disable" : "Enable"}
              </button>
              <button disabled={busy} onClick={() => remove(m.id)} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
