"use client";

import { useEffect, useState } from "react";
import type { AuthPolicyData } from "./types";
import { ROLES } from "./types";

const inputClass = "w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white";

function Toggle({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5" />
      <span>
        <span className="text-gray-200">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-gray-500">{help}</span>}
      </span>
    </label>
  );
}

export default function OtpEnforcementTab() {
  const [policy, setPolicy] = useState<AuthPolicyData | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/developer/auth-policy")
      .then((r) => r.json())
      .then((d) => setPolicy(d.policy));
  }, []);

  function set<K extends keyof AuthPolicyData>(key: K, value: AuthPolicyData[K]) {
    setPolicy((p) => (p ? { ...p, [key]: value } : p));
  }

  function toggleRole(role: string) {
    if (!policy) return;
    const next = policy.forceOtpForRoles.includes(role)
      ? policy.forceOtpForRoles.filter((r) => r !== role)
      : [...policy.forceOtpForRoles, role];
    set("forceOtpForRoles", next);
  }

  async function save() {
    if (!policy) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/developer/auth-policy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(policy),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Could not save policy." });
      return;
    }
    setMessage({ type: "ok", text: "Configuration saved." });
  }

  async function reset() {
    if (!confirm("Reset OTP enforcement policy to defaults?")) return;
    setBusy(true);
    const res = await fetch("/api/developer/auth-policy", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setPolicy(data.policy);
      setMessage({ type: "ok", text: "Policy reset to defaults." });
    }
  }

  if (!policy) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white">OTP enforcement policy</h2>
        <p className="mt-1 text-sm text-gray-400">Defaults: registration and new-device logins require OTP; trusted devices skip it.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Toggle label="Require OTP on registration" checked={policy.requireOtpOnRegistration} onChange={(v) => set("requireOtpOnRegistration", v)} help="New accounts always verify — this is structural and can't be disabled." />
          <Toggle label="Require OTP on login from a new device or browser" checked={policy.requireOtpOnNewDevice} onChange={(v) => set("requireOtpOnNewDevice", v)} />
          <Toggle label="Require OTP when changing phone number" checked={policy.requireOtpOnChangePhone} onChange={(v) => set("requireOtpOnChangePhone", v)} />
          <Toggle label="Require OTP when changing email address" checked={policy.requireOtpOnChangeEmail} onChange={(v) => set("requireOtpOnChangeEmail", v)} />
          <Toggle label="Force OTP for all administrator accounts, every login" checked={policy.forceOtpForAdmins} onChange={(v) => set("forceOtpForAdmins", v)} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Force OTP for specific roles</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                policy.forceOtpForRoles.includes(role) ? "bg-emerald-600 text-white" : "border border-gray-700 text-gray-300"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Trusted devices</h2>
        <div className="mt-3 space-y-3">
          <Toggle label="Enable trusted devices" checked={policy.trustedDevicesEnabled} onChange={(v) => set("trustedDevicesEnabled", v)} help="Off means every login always requires OTP, regardless of device history." />
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="text-gray-300">Trusted device validity period</span>
              <select
                value={policy.trustedDeviceValidityDays}
                onChange={(e) => set("trustedDeviceValidityDays", Number(e.target.value))}
                className={`${inputClass} mt-1`}
              >
                {[7, 30, 60, 90].map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-gray-300">Max trusted devices per user</span>
              <input
                type="number"
                min={1}
                max={50}
                value={policy.maxTrustedDevicesPerUser}
                onChange={(e) => set("maxTrustedDevicesPerUser", Number(e.target.value))}
                className={`${inputClass} mt-1`}
              />
            </label>
          </div>
          <Toggle label="Force OTP after trusted device expiration" checked={policy.forceOtpAfterDeviceExpiry} onChange={(v) => set("forceOtpAfterDeviceExpiry", v)} help="Structural — an expired device is never treated as trusted." />
          <Toggle label="Force OTP after logout" checked={policy.forceOtpAfterLogout} onChange={(v) => set("forceOtpAfterLogout", v)} help="If on, logging out revokes this device's trust, so the next login needs a code again." />
          <Toggle label="Force OTP after email change" checked={policy.forceOtpAfterEmailChange} onChange={(v) => set("forceOtpAfterEmailChange", v)} help="Revokes all of this user's trusted devices when their email changes." />
          <Toggle label="Force OTP after phone number change" checked={policy.forceOtpAfterPhoneChange} onChange={(v) => set("forceOtpAfterPhoneChange", v)} help="Revokes all of this user's trusted devices when their phone changes." />
          <Toggle label="Force OTP after suspicious login attempts" checked={policy.forceOtpAfterSuspiciousLogin} onChange={(v) => set("forceOtpAfterSuspiciousLogin", v)} help="3+ failed attempts for a phone number in the last hour forces OTP even from a trusted device." />
        </div>
      </section>

      {message && <p className={message.type === "ok" ? "text-sm text-emerald-400" : "text-sm text-red-400"}>{message.text}</p>}

      <div className="flex gap-2">
        <button onClick={save} disabled={busy} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          Save Configuration
        </button>
        <button onClick={reset} disabled={busy} className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-200">
          Reset Configuration
        </button>
      </div>
    </div>
  );
}
