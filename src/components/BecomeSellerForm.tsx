"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BecomeSellerForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [callPhoneNumber, setCallPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          registrationNumber: registrationNumber || undefined,
          district: district || undefined,
          description: description || undefined,
          whatsappNumber: whatsappNumber || undefined,
          callPhoneNumber: callPhoneNumber || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit your application.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Application submitted</h2>
        <p className="mt-2 text-gray-700">
          Our team will review it shortly. You&apos;ll be notified once it&apos;s approved and can start listing
          cars, with a free 30-day trial included.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Business or seller name</label>
        <input
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Blantyre Motors Ltd, or your own name"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Business registration number (optional)</label>
        <input
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">District (optional)</label>
        <input
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Tell us about your business (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">WhatsApp number (optional)</label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="e.g. 0991234567"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Call phone number (optional)</label>
          <input
            type="tel"
            value={callPhoneNumber}
            onChange={(e) => setCallPhoneNumber(e.target.value)}
            placeholder="e.g. 0881234567"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Leave these blank to use your account&apos;s login number for buyer calls/WhatsApp. You can add or change them anytime from your dashboard.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
