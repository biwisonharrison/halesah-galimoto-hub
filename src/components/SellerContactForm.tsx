"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerContactForm({
  whatsappNumber,
  callPhoneNumber,
}: {
  whatsappNumber: string | null;
  callPhoneNumber: string | null;
}) {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState(whatsappNumber ?? "");
  const [call, setCall] = useState(callPhoneNumber ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/seller/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber: whatsapp, callPhoneNumber: call }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Couldn't save your contact details." });
      return;
    }
    setWhatsapp(data.whatsappNumber ?? "");
    setCall(data.callPhoneNumber ?? "");
    setMessage({ type: "ok", text: "Saved. Buyers will now see these numbers on all your active listings." });
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">Contact information</h2>
      <p className="mt-1 text-sm text-gray-500">
        These numbers appear as the &ldquo;Call seller&rdquo; and &ldquo;Chat on WhatsApp&rdquo; buttons on all of your active listings.
      </p>
      <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">WhatsApp number</span>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="e.g. 0991234567"
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Call phone number</span>
          <input
            type="tel"
            value={call}
            onChange={(e) => setCall(e.target.value)}
            placeholder="e.g. 0881234567"
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            {busy ? "Saving…" : "Save contact information"}
          </button>
          {message && (
            <p className={`mt-2 text-sm ${message.type === "ok" ? "text-brand-700" : "text-red-600"}`}>{message.text}</p>
          )}
        </div>
      </form>
    </div>
  );
}
