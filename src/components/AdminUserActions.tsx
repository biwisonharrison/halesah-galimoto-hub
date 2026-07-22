"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminUserActions({
  userId,
  isSeller,
  sellerVerified,
  isAdmin,
  currentPhone,
  currentName,
}: {
  userId: string;
  isSeller: boolean;
  sellerVerified: boolean;
  isAdmin: boolean;
  currentPhone: string;
  currentName: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState(currentPhone);
  const [name, setName] = useState(currentName ?? "");
  const [error, setError] = useState<string | null>(null);

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

  async function saveLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit-login", phone, name }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn't update login details.");
      return;
    }
    setShowLogin(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-2">
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
        <button disabled={busy} onClick={() => setShowLogin((v) => !v)} className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-50">
          Edit login details
        </button>
      </div>
      {showLogin && (
        <form onSubmit={saveLogin} className="w-64 space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm">
          <label className="block text-xs">
            <span className="font-medium text-ink">Login phone number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </label>
          <label className="block text-xs">
            <span className="font-medium text-ink">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </label>
          <p className="text-xs text-gray-400">
            This changes how the account signs in. It does not affect their WhatsApp or call contact numbers.
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            Save login details
          </button>
        </form>
      )}
    </div>
  );
}
