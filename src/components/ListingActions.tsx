"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ListingActions({
  listingId,
  isLoggedIn,
  initiallyFavorited,
  sellerPhone,
}: {
  listingId: string;
  isLoggedIn: boolean;
  initiallyFavorited: boolean;
  sellerPhone: string;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleFavorite() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/marketplace/${listingId}`);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/listings/${listingId}/favorite`, { method: favorited ? "DELETE" : "POST" });
    if (res.ok) setFavorited(!favorited);
    setBusy(false);
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push(`/login?redirect=/marketplace/${listingId}`);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/listings/${listingId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) setReportSent(true);
    setBusy(false);
  }

  const whatsappHref = `https://wa.me/${sellerPhone.replace("+", "")}?text=${encodeURIComponent(
    "Hi, I saw your car listing on Halesah Galimoto Hub. Is it still available?"
  )}`;

  return (
    <div className="space-y-3">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="block rounded-lg bg-brand-600 px-4 py-3 text-center font-semibold text-white hover:bg-brand-700"
      >
        Message on WhatsApp
      </a>
      <a
        href={`tel:${sellerPhone}`}
        className="block rounded-lg border border-gray-300 px-4 py-3 text-center font-semibold text-ink hover:bg-gray-50"
      >
        Call seller
      </a>
      <button
        onClick={toggleFavorite}
        disabled={busy}
        className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-semibold text-ink hover:bg-gray-50 disabled:opacity-60"
      >
        {favorited ? "★ Saved" : "☆ Save this car"}
      </button>

      {!showReport && !reportSent && (
        <button onClick={() => setShowReport(true)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600">
          Report this listing
        </button>
      )}
      {reportSent && <p className="text-center text-xs text-brand-700">Thanks. Our team will review this within 24 hours.</p>}
      {showReport && !reportSent && (
        <form onSubmit={submitReport} className="space-y-2 rounded-lg border border-gray-200 p-3">
          <textarea
            required
            minLength={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What's wrong with this listing?"
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            rows={3}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-ink px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Submit report
          </button>
        </form>
      )}
    </div>
  );
}
