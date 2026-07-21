"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HistoryRestoreButton({ historyId }: { historyId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleRestore() {
    if (!confirm("Restore this version? The current settings will be saved to history first so you can undo this too.")) return;
    setBusy(true);
    const res = await fetch(`/api/developer/settings/history/${historyId}/restore`, { method: "POST" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={handleRestore}
      disabled={busy}
      className="shrink-0 rounded-lg border border-gray-700 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-60"
    >
      {busy ? "Restoring…" : "Restore"}
    </button>
  );
}
