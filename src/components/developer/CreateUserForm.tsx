"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLE_OPTIONS = [
  { value: "BUYER", label: "Customer" },
  { value: "DEALER", label: "Dealer" },
  { value: "SALES_AGENT", label: "Sales Agent" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Administrator" },
  { value: "DEVELOPER", label: "Developer" },
];

export default function CreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("BUYER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/developer/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name, role }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create the account.");
      return;
    }
    setPhone("");
    setName("");
    setRole("BUYER");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400"
      >
        + Create user
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (e.g. 0991234567)"
          className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white">
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={busy || !name || !phone}
            className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create"}
          </button>
          <button onClick={() => setOpen(false)} className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800">
            Cancel
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-gray-500">
        This account skips OTP verification since a developer is vouching for it directly. The person can still log in
        normally afterwards using their phone number.
      </p>
    </div>
  );
}
