"use client";

import { useState } from "react";
import type { OtpSettingsData } from "./types";

function Field({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-gray-300">{label}</span>
      <div className="mt-1">{children}</div>
      {help && <span className="mt-1 block text-xs text-gray-500">{help}</span>}
    </label>
  );
}

const inputClass = "w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white";

export default function OtpSettingsTab({ settings, onChanged }: { settings: OtpSettingsData; onChanged: () => void }) {
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function set<K extends keyof OtpSettingsData>(key: K, value: OtpSettingsData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function moveChannel(index: number, dir: -1 | 1) {
    const next = [...form.channelPriority];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set("channelPriority", next);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/developer/otp/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Could not save settings." });
      return;
    }
    setMessage({ type: "ok", text: "Configuration saved." });
    onChanged();
  }

  async function reset() {
    if (!confirm("Reset all OTP settings to defaults? Provider configurations and logs are not affected.")) return;
    setBusy(true);
    const res = await fetch("/api/developer/otp/settings", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setForm(data.settings);
      setMessage({ type: "ok", text: "Settings reset to defaults." });
      onChanged();
    }
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white">Enable / Disable</h2>
        <label className="mt-3 flex items-center gap-3 text-sm text-gray-200">
          <input type="checkbox" checked={form.otpEnabled} onChange={(e) => set("otpEnabled", e.target.checked)} />
          OTP verification is enabled site-wide
        </label>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Delivery channel priority</h2>
        <p className="mt-1 text-sm text-gray-400">If the first channel fails to deliver, the next one is tried automatically.</p>
        <ol className="mt-3 space-y-2">
          {form.channelPriority.map((ch, i) => (
            <li key={ch} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white">
              <span>{i + 1}. {ch}</span>
              <span className="flex gap-1">
                <button type="button" onClick={() => moveChannel(i, -1)} className="rounded border border-gray-700 px-2 py-0.5 text-xs">↑</button>
                <button type="button" onClick={() => moveChannel(i, 1)} className="rounded border border-gray-700 px-2 py-0.5 text-xs">↓</button>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">OTP settings</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Field label="OTP Length">
            <input type="number" min={4} max={10} value={form.otpLength} onChange={(e) => set("otpLength", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="OTP Format">
            <select value={form.otpFormat} onChange={(e) => set("otpFormat", e.target.value as "NUMERIC" | "ALPHANUMERIC")} className={inputClass}>
              <option value="NUMERIC">Numeric</option>
              <option value="ALPHANUMERIC">Alphanumeric</option>
            </select>
          </Field>
          <Field label="Expiry Time (minutes)">
            <input type="number" min={1} max={60} value={form.otpExpiryMinutes} onChange={(e) => set("otpExpiryMinutes", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Default Country Code">
            <input value={form.defaultCountryCode} onChange={(e) => set("defaultCountryCode", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Allowed Countries" help="Comma-separated dial codes, e.g. +265,+27. Leave blank to allow all.">
            <input value={form.allowedCountries ?? ""} onChange={(e) => set("allowedCountries", e.target.value || null)} className={inputClass} />
          </Field>
          <Field label="Blocked Countries" help="Comma-separated dial codes to always reject.">
            <input value={form.blockedCountries ?? ""} onChange={(e) => set("blockedCountries", e.target.value || null)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Rate limiting</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Field label="Max Verification Attempts">
            <input type="number" min={1} max={20} value={form.maxVerifyAttempts} onChange={(e) => set("maxVerifyAttempts", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Max Resend Attempts">
            <input type="number" min={1} max={20} value={form.maxResendAttempts} onChange={(e) => set("maxResendAttempts", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Resend Cooldown (seconds)">
            <input type="number" min={0} max={600} value={form.resendCooldownSeconds} onChange={(e) => set("resendCooldownSeconds", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Max Requests Per Hour">
            <input type="number" min={1} max={1000} value={form.maxRequestsPerHour} onChange={(e) => set("maxRequestsPerHour", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Max Requests Per Day">
            <input type="number" min={1} max={5000} value={form.maxRequestsPerDay} onChange={(e) => set("maxRequestsPerDay", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Lockout Duration (minutes)">
            <input type="number" min={1} max={1440} value={form.lockoutDurationMinutes} onChange={(e) => set("lockoutDurationMinutes", Number(e.target.value))} className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Webhooks</h2>
        <p className="mt-1 text-sm text-gray-400">Fired on delivery, verification, and failure events. Logged under Delivery Logs.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Field label="Delivery Status Webhook">
            <input value={form.webhookDeliveryUrl ?? ""} onChange={(e) => set("webhookDeliveryUrl", e.target.value || null)} className={inputClass} placeholder="https://…" />
          </Field>
          <Field label="Verification Webhook">
            <input value={form.webhookVerificationUrl ?? ""} onChange={(e) => set("webhookVerificationUrl", e.target.value || null)} className={inputClass} placeholder="https://…" />
          </Field>
          <Field label="Failure Webhook">
            <input value={form.webhookFailureUrl ?? ""} onChange={(e) => set("webhookFailureUrl", e.target.value || null)} className={inputClass} placeholder="https://…" />
          </Field>
        </div>
      </section>

      {message && <p className={message.type === "ok" ? "text-sm text-emerald-400" : "text-sm text-red-400"}>{message.text}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          Save Configuration
        </button>
        <button type="button" onClick={reset} disabled={busy} className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-200">
          Reset Configuration
        </button>
      </div>
    </form>
  );
}
