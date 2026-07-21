"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSellerActions({ sellerAccountId, status }: { sellerAccountId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function act(action: "approve" | "suspend" | "reactivate") {
    setBusy(true);
    await fetch(`/api/admin/sellers/${sellerAccountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  async function reject(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch(`/api/admin/sellers/${sellerAccountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", rejectionReason: reason || undefined }),
    });
    setBusy(false);
    setShowReject(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this seller account? Their listings will remain but they'll lose seller access.")) return;
    setBusy(true);
    await fetch(`/api/admin/sellers/${sellerAccountId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2 text-xs">
        {status === "PENDING_APPROVAL" && (
          <>
            <button disabled={busy} onClick={() => act("approve")} className="rounded-md bg-brand-600 px-2.5 py-1.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
              Approve
            </button>
            <button disabled={busy} onClick={() => setShowReject((v) => !v)} className="rounded-md border border-red-200 px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
              Reject
            </button>
          </>
        )}
        {status === "APPROVED" && (
          <button disabled={busy} onClick={() => act("suspend")} className="rounded-md border border-amber-300 px-2.5 py-1.5 font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
            Suspend
          </button>
        )}
        {status === "SUSPENDED" && (
          <button disabled={busy} onClick={() => act("reactivate")} className="rounded-md border border-brand-300 px-2.5 py-1.5 font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50">
            Reactivate
          </button>
        )}
        {status === "REJECTED" && (
          <button disabled={busy} onClick={() => act("approve")} className="rounded-md bg-brand-600 px-2.5 py-1.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            Approve anyway
          </button>
        )}
        <button disabled={busy} onClick={remove} className="rounded-md border border-red-200 px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
          Delete account
        </button>
      </div>
      {showReject && (
        <form onSubmit={reject} className="w-64 space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            rows={2}
            className="w-full rounded-md border border-gray-300 p-2 text-xs"
          />
          <button type="submit" disabled={busy} className="w-full rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            Confirm rejection
          </button>
        </form>
      )}
    </div>
  );
}
