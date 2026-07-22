"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StarRatingInput from "./StarRatingInput";

export default function ReviewForm({
  sellerId,
  listingId,
  contextLabel,
}: {
  sellerId?: string;
  listingId?: string;
  contextLabel?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title || undefined,
          comment,
          sellerId,
          listingId,
          displayAnonymously: anonymous,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit your review.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Thank you for your review</h2>
        <p className="mt-2 text-gray-700">
          Your review is pending approval. Once our team reviews it, it may appear publicly on the site.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {contextLabel && (
        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">Reviewing: {contextLabel}</p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Review title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Your review</label>
        <textarea
          required
          minLength={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Tell other buyers about your experience..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
        Post this review anonymously (hide my name)
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
