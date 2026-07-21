"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminUserActions({
  userId,
  isSeller,
  sellerVerified,
  isAdmin,
}: {
  userId: string;
  isSeller: boolean;
  sellerVerified: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "verify-seller" | "make-admin" | "make-buyer") {
    setBusy(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {isSeller && !sellerVerified && (
        <button disabled={busy} onClick={() => act("verify-seller")} className="rounded-md border border-brand-300 px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50">
          Verify seller
        </button>
      )}
      {!isAdmin ? (
        <button disabled={busy} onClick={() => act("make-admin")} className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
          Make admin
        </button>
      ) : (
        <button disabled={busy} onClick={() => act("make-buyer")} className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
          Revoke admin
        </button>
      )}
    </div>
  );
}
