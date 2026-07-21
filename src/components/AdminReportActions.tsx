"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "dismiss" | "action") {
    setBusy(true);
    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => act("action")} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
        Remove listing
      </button>
      <button disabled={busy} onClick={() => act("dismiss")} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
        Dismiss
      </button>
    </div>
  );
}
