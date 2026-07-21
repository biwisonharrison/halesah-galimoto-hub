"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminCreateSellerForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.get("phone"),
        name: form.get("name") || undefined,
        businessName: form.get("businessName"),
        registrationNumber: form.get("registrationNumber") || undefined,
        district: form.get("district") || undefined,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-2">
      <h3 className="font-semibold text-ink sm:col-span-2">Create a seller account directly</h3>
      {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      <input name="phone" required placeholder="Phone number" className={inputClass} />
      <input name="name" placeholder="Contact name (optional)" className={inputClass} />
      <input name="businessName" required placeholder="Business or seller name" className={inputClass} />
      <input name="registrationNumber" placeholder="Registration number (optional)" className={inputClass} />
      <input name="district" placeholder="District (optional)" className={inputClass} />
      <button disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
        {busy ? "Creating…" : "Create approved seller"}
      </button>
      <p className="text-xs text-gray-400 sm:col-span-2">Created directly with APPROVED status and a fresh 30-day trial.</p>
    </form>
  );
}

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
