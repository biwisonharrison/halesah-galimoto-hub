"use client";

import { useState } from "react";
import type { ProviderConfig } from "./types";

export default function OtpProviderCard({
  provider,
  onChanged,
  onEdit,
}: {
  provider: ProviderConfig;
  onChanged: () => void;
  onEdit: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string> | null>(null);
  const [testTo, setTestTo] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string; providerResponse?: string; responseTimeMs: number } | null>(null);
  const [showTest, setShowTest] = useState(false);

  async function toggleActive() {
    setBusy(true);
    await fetch(`/api/developer/otp/providers/${provider.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: provider.isActive ? "deactivate" : "activate" }),
    });
    setBusy(false);
    onChanged();
  }

  async function remove() {
    if (!confirm(`Delete "${provider.label}"? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/developer/otp/providers/${provider.id}`, { method: "DELETE" });
    setBusy(false);
    onChanged();
  }

  async function reveal() {
    if (revealed) {
      setRevealed(null);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/developer/otp/providers/${provider.id}/reveal`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setRevealed(data.credentials);
  }

  async function runTest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTestResult(null);
    const res = await fetch(`/api/developer/otp/providers/${provider.id}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testTo }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setTestResult(data);
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">
            {provider.icon} {provider.label}
            <span className="ml-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs font-normal text-gray-400">{provider.providerLabel}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {provider.environment} · {provider.chainRole}
            {provider.chainRole === "BACKUP" && ` (priority ${provider.priority})`}
          </p>
          {provider.lastTestedAt && (
            <p className={`mt-1 text-xs ${provider.lastTestStatus === "SUCCESS" ? "text-emerald-400" : "text-red-400"}`}>
              Last test: {provider.lastTestStatus} ({provider.lastTestResponseMs}ms) — {new Date(provider.lastTestedAt).toLocaleString()}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            provider.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-700 text-gray-300"
          }`}
        >
          {provider.isActive ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button disabled={busy} onClick={toggleActive} className="rounded-md bg-emerald-700 px-2.5 py-1.5 font-semibold text-white disabled:opacity-50">
          {provider.isActive ? "Deactivate" : "Activate"}
        </button>
        <button disabled={busy} onClick={onEdit} className="rounded-md border border-gray-700 px-2.5 py-1.5 font-medium text-gray-200">
          Edit
        </button>
        <button disabled={busy} onClick={() => setShowTest((v) => !v)} className="rounded-md border border-gray-700 px-2.5 py-1.5 font-medium text-gray-200">
          Test connection
        </button>
        <button disabled={busy} onClick={reveal} className="rounded-md border border-gray-700 px-2.5 py-1.5 font-medium text-gray-200">
          {revealed ? "Hide credentials" : "View credentials"}
        </button>
        <button disabled={busy} onClick={remove} className="rounded-md border border-red-900 px-2.5 py-1.5 font-medium text-red-400">
          Delete
        </button>
      </div>

      {revealed && (
        <div className="mt-3 rounded-lg bg-gray-950 p-3 text-xs text-gray-300">
          {Object.entries(revealed).map(([k, v]) => (
            <p key={k}>
              <span className="text-gray-500">{k}:</span> {v}
            </p>
          ))}
          <p className="mt-2 text-amber-400">This view was recorded in the audit log.</p>
        </div>
      )}

      {showTest && (
        <form onSubmit={runTest} className="mt-3 space-y-2 rounded-lg bg-gray-950 p-3">
          <input
            required
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder={provider.channel === "EMAIL" ? "test@example.com" : "+265991234567"}
            className="w-full rounded-md border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-white"
          />
          <button type="submit" disabled={busy} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            {busy ? "Sending…" : `Send Test ${provider.channel === "EMAIL" ? "Email" : provider.channel === "WHATSAPP" ? "WhatsApp" : "SMS"} OTP`}
          </button>
          {testResult && (
            <div className={`rounded-md p-2 text-xs ${testResult.success ? "bg-emerald-950/50 text-emerald-300" : "bg-red-950/50 text-red-300"}`}>
              <p className="font-semibold">{testResult.success ? "Success" : "Failure"} · {testResult.responseTimeMs}ms</p>
              {testResult.providerResponse && <p className="mt-1 break-all">{testResult.providerResponse}</p>}
              {testResult.error && <p className="mt-1 break-all">{testResult.error}</p>}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
