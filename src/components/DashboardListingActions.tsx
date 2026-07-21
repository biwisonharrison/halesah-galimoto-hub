"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardListingActions({ listingId, status }: { listingId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showDeletionForm, setShowDeletionForm] = useState(false);
  const [reason, setReason] = useState("");

  async function act(action: "mark-sold" | "reactivate") {
    setBusy(true);
    await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  async function requestDeletion(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch(`/api/listings/${listingId}/request-deletion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || undefined }),
    });
    setBusy(false);
    setShowDeletionForm(false);
    router.refresh();
  }

  const canEdit = ["DRAFT", "PENDING_APPROVAL", "ACTIVE", "HIDDEN", "REJECTED"].includes(status);
  const canRequestDeletion = !["PENDING_DELETION", "DELETED"].includes(status);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2 text-xs">
        {canEdit && (
          <Link
            href={`/dashboard/listings/${listingId}/edit`}
            className="rounded-md border border-gray-300 px-2.5 py-1.5 font-medium text-ink hover:bg-gray-50"
          >
            Edit
          </Link>
        )}
        {status === "ACTIVE" && (
          <button disabled={busy} onClick={() => act("mark-sold")} className="rounded-md border border-gray-300 px-2.5 py-1.5 font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
            Mark as sold
          </button>
        )}
        {(status === "SOLD" || status === "EXPIRED") && (
          <button disabled={busy} onClick={() => act("reactivate")} className="rounded-md border border-brand-300 px-2.5 py-1.5 font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50">
            Reactivate
          </button>
        )}
        {canRequestDeletion && (
          <button
            disabled={busy}
            onClick={() => setShowDeletionForm((v) => !v)}
            className="rounded-md border border-red-200 px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Request deletion
          </button>
        )}
      </div>
      {showDeletionForm && (
        <form onSubmit={requestDeletion} className="w-64 space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you deleting this listing? (optional)"
            rows={2}
            className="w-full rounded-md border border-gray-300 p-2 text-xs"
          />
          <button type="submit" disabled={busy} className="w-full rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            Submit request
          </button>
          <p className="text-xs text-gray-400">An admin needs to approve this before the listing is deleted.</p>
        </form>
      )}
    </div>
  );
}
