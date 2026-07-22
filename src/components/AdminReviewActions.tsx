"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminReviewActions({
  reviewId,
  status,
  title,
  comment,
  rating,
}: {
  reviewId: string;
  status: string;
  title: string | null;
  comment: string;
  rating: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(title ?? "");
  const [editComment, setEditComment] = useState(comment);
  const [editRating, setEditRating] = useState(rating);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", title: editTitle || undefined, comment: editComment, rating: editRating }),
    });
    setBusy(false);
    setShowEdit(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(true);
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2 text-xs">
        {status !== "APPROVED" && (
          <button disabled={busy} onClick={() => act("approve")} className="rounded-md bg-brand-600 px-2.5 py-1.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            Approve
          </button>
        )}
        {status !== "REJECTED" && (
          <button disabled={busy} onClick={() => act("reject")} className="rounded-md border border-amber-300 px-2.5 py-1.5 font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
            Reject
          </button>
        )}
        <button disabled={busy} onClick={() => setShowEdit((v) => !v)} className="rounded-md border border-gray-300 px-2.5 py-1.5 font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
          Edit
        </button>
        <button disabled={busy} onClick={remove} className="rounded-md border border-red-200 px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
          Delete
        </button>
      </div>
      {showEdit && (
        <form onSubmit={saveEdit} className="w-72 space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm">
          <label className="block text-xs">
            <span className="font-medium text-ink">Rating (1-5)</span>
            <input
              type="number"
              min={1}
              max={5}
              value={editRating}
              onChange={(e) => setEditRating(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </label>
          <label className="block text-xs">
            <span className="font-medium text-ink">Title</span>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </label>
          <label className="block text-xs">
            <span className="font-medium text-ink">Comment</span>
            <textarea
              required
              minLength={5}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </label>
          <button type="submit" disabled={busy} className="w-full rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            Save changes
          </button>
        </form>
      )}
    </div>
  );
}
