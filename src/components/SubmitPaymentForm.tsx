"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMWK } from "@/lib/format";

type Plan = { id: string; name: string; priceMwk: number; durationDays: number };
type Method = { id: string; label: string };

export default function SubmitPaymentForm({ plans, methods }: { plans: Plan[]; methods: Method[] }) {
  const router = useRouter();
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [amountMwk, setAmountMwk] = useState(plans[0] ? String(plans[0].priceMwk) : "");
  const [paymentMethodId, setPaymentMethodId] = useState(methods[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function handlePlanChange(id: string) {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (plan) setAmountMwk(String(plan.priceMwk));
  }

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      setProofUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proofUrl) {
      setError("Upload your proof of payment first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountMwk: Number(amountMwk),
          planId: planId || undefined,
          paymentMethodId: paymentMethodId || undefined,
          proofUrl,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit payment.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit payment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
        <h3 className="font-semibold text-ink">Payment submitted</h3>
        <p className="mt-2 text-sm text-gray-700">An admin will confirm it shortly. You&apos;ll be notified either way.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-ink">Submit proof of payment</h3>

      {plans.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Plan</label>
          <select value={planId} onChange={(e) => handlePlanChange(e.target.value)} className={inputClass}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatMWK(p.priceMwk)} / {p.durationDays} days
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Amount paid (MWK)</label>
        <input type="number" required value={amountMwk} onChange={(e) => setAmountMwk(e.target.value)} className={inputClass} />
      </div>

      {methods.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Paid via</label>
          <select value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)} className={inputClass}>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Proof of payment (screenshot or photo)</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProofUpload} disabled={uploading} className="text-sm" />
        {proofUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={proofUrl} alt="Proof of payment" className="mt-2 h-32 rounded-lg border border-gray-200 object-cover" />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit payment"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
