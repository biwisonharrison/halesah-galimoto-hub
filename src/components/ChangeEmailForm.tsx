"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangeEmailForm({ currentEmail }: { currentEmail: string | null }) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"idle" | "code-sent" | "done">("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account/change-email/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not send a code.");
      return;
    }
    if (data.applied) {
      setStep("done");
      router.refresh();
      return;
    }
    setStep("code-sent");
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account/change-email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, code }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not verify that code.");
      return;
    }
    setStep("done");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-ink">Email address</h2>
      <p className="mt-1 text-sm text-gray-500">Current: {currentEmail ?? "Not set"}</p>

      {step === "done" ? (
        <p className="mt-3 text-sm text-brand-700">Your email address was updated.</p>
      ) : step === "code-sent" ? (
        <form onSubmit={confirmCode} className="mt-3 space-y-3">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the code we sent"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Confirm new email
          </button>
        </form>
      ) : (
        <form onSubmit={requestCode} className="mt-3 space-y-3">
          <input
            required
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Send verification code
          </button>
        </form>
      )}
    </div>
  );
}
