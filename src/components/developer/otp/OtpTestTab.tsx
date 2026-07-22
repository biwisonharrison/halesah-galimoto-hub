"use client";

import { useState } from "react";
import type { ProviderConfig } from "./types";

export default function OtpTestTab({ providers }: { providers: ProviderConfig[] }) {
  const [providerId, setProviderId] = useState(providers[0]?.id ?? "");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string; providerResponse?: string; responseTimeMs: number } | null>(null);

  const selected = providers.find((p) => p.id === providerId);

  async function runTest(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId) return;
    setBusy(true);
    setResult(null);
    const res = await fetch(`/api/developer/otp/providers/${providerId}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setResult(data);
  }

  if (providers.length === 0) {
    return <p className="text-sm text-gray-400">Configure a provider on the Providers tab first, then come back here to test it.</p>;
  }

  return (
    <form onSubmit={runTest} className="max-w-md space-y-4">
      <label className="block text-sm">
        <span className="text-gray-300">Provider</span>
        <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white">
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.label} ({p.channel})
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="text-gray-300">{selected?.channel === "EMAIL" ? "Email address" : "Phone number"}</span>
        <input
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={selected?.channel === "EMAIL" ? "test@example.com" : "+265991234567"}
          className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
        />
      </label>

      <button type="submit" disabled={busy} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? "Sending…" : `Send Test ${selected?.channel === "EMAIL" ? "Email" : selected?.channel === "WHATSAPP" ? "WhatsApp" : "SMS"} OTP`}
      </button>

      {result && (
        <div className={`rounded-lg p-4 text-sm ${result.success ? "bg-emerald-950/50 text-emerald-300" : "bg-red-950/50 text-red-300"}`}>
          <p className="font-semibold">{result.success ? "Success" : "Failure"}</p>
          <p className="mt-1">Response time: {result.responseTimeMs}ms</p>
          {result.providerResponse && <p className="mt-1 break-all">Provider response: {result.providerResponse}</p>}
          {result.error && <p className="mt-1 break-all">Error: {result.error}</p>}
        </div>
      )}
    </form>
  );
}
