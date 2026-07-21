"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPaymentActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "confirm" | "reject") {
    setBusy(true);
    await fetch(`/api/admin/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => act("confirm")} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
        Confirm
      </button>
      <button disabled={busy} onClick={() => act("reject")} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
        Reject
      </button>
    </div>
  );
}
