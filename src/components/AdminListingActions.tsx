"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminListingActions({
  listingId,
  status,
  featured,
}: {
  listingId: string;
  status: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showNotes, setShowNotes] = useState<"reject" | "request-changes" | null>(null);
  const [notes, setNotes] = useState("");

  async function statusAction(action: "mark-sold" | "reactivate" | "hide" | "remove" | "feature" | "unfeature") {
    setBusy(true);
    await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  async function review(action: "approve" | "reject" | "request-changes") {
    setBusy(true);
    await fetch(`/api/admin/listings/${listingId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes: notes || undefined }),
    });
    setBusy(false);
    setShowNotes(null);
    setNotes("");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2 text-xs">
        {status !== "DELETED" && (
          <button
            disabled={busy}
            onClick={() => statusAction(featured ? "unfeature" : "feature")}
            className={`rounded-md px-2.5 py-1.5 font-medium disabled:opacity-50 ${
              featured ? "border border-amber-300 bg-amber-50 text-amber-700" : "border border-gray-300 text-ink hover:bg-gray-50"
            }`}
          >
            {featured ? "Featured ★" : "Feature"}
          </button>
        )}
        {status === "PENDING_APPROVAL" && (
          <>
            <button disabled={busy} onClick={() => review("approve")} className="rounded-md bg-brand-600 px-2.5 py-1.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
              Approve
            </button>
            <button disabled={busy} onClick={() => setShowNotes("request-changes")} className="rounded-md border border-amber-300 px-2.5 py-1.5 font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
              Request changes
            </button>
            <button disabled={busy} onClick={() => setShowNotes("reject")} className="rounded-md border border-red-200 px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
              Reject
            </button>
          </>
        )}
        {status === "ACTIVE" && (
          <>
            <button disabled={busy} onClick={() => statusAction("mark-sold")} className="rounded-md border border-gray-300 px-2.5 py-1.5 font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
              Mark as sold
            </button>
            <button disabled={busy} onClick={() => statusAction("hide")} className="rounded-md border border-gray-300 px-2.5 py-1.5 font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
              Hide
            </button>
          </>
        )}
        {(status === "HIDDEN" || status === "SOLD" || status === "EXPIRED") && (
          <button disabled={busy} onClick={() => statusAction("reactivate")} className="rounded-md border border-brand-300 px-2.5 py-1.5 font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50">
            Reactivate
          </button>
        )}
        {status !== "DELETED" && (
          <button disabled={busy} onClick={() => statusAction("remove")} className="rounded-md border border-red-200 px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
            Remove
          </button>
        )}
      </div>
      {showNotes && (
        <div className="w-64 space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={showNotes === "reject" ? "Reason for rejection" : "What needs to change?"}
            rows={2}
            className="w-full rounded-md border border-gray-300 p-2 text-xs"
          />
          <button
            onClick={() => review(showNotes)}
            disabled={busy}
            className="w-full rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
