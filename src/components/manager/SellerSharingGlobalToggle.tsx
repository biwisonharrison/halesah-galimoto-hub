"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerSharingGlobalToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle(next: boolean) {
    setBusy(true);
    await fetch("/api/manager/seller-sharing/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <span className="text-sm font-medium text-ink">
        Seller Inventory Sharing is currently{" "}
        <span className={enabled ? "font-semibold text-brand-700" : "font-semibold text-red-600"}>
          {enabled ? "enabled" : "disabled"}
        </span>{" "}
        site-wide.
      </span>
      <button
        disabled={busy}
        onClick={() => toggle(!enabled)}
        className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
          enabled ? "border border-red-200 text-red-600 hover:bg-red-50" : "bg-brand-600 text-white hover:bg-brand-700"
        }`}
      >
        {enabled ? "Disable Seller Inventory Sharing" : "Enable Seller Inventory Sharing"}
      </button>
    </div>
  );
}
