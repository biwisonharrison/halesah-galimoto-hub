"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminDeletionRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    await fetch(`/api/admin/deletion-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => act("approve")} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
        Approve deletion
      </button>
      <button disabled={busy} onClick={() => act("reject")} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
        Reject
      </button>
    </div>
  );
}
