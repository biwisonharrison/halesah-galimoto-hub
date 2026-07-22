"use client";

import { useEffect, useState } from "react";

interface Device {
  id: string;
  label: string;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export default function TrustedDevicesManager() {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/account/trusted-devices");
    const data = await res.json().catch(() => ({}));
    setDevices(data.devices ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function removeOne(id: string) {
    setBusy(true);
    await fetch(`/api/account/trusted-devices?id=${id}`, { method: "DELETE" });
    setBusy(false);
    load();
  }

  async function removeAll() {
    if (!confirm("Remove all trusted devices? You'll need to verify a code on every device the next time you log in.")) return;
    setBusy(true);
    await fetch("/api/account/trusted-devices?all=true", { method: "DELETE" });
    setBusy(false);
    load();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Trusted devices</h2>
        {devices && devices.length > 0 && (
          <button onClick={removeAll} disabled={busy} className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50">
            Remove all
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">Devices you chose to remember can log in without a verification code.</p>

      {devices === null ? (
        <p className="mt-4 text-sm text-gray-400">Loading…</p>
      ) : devices.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No trusted devices yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {devices.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
              <div className="text-sm">
                <p className="font-medium text-ink">
                  {d.label}
                  {d.isCurrent && <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-800">This device</span>}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {d.ipAddress ?? "Unknown IP"} · Last active {new Date(d.lastActiveAt).toLocaleString()} · Expires{" "}
                  {new Date(d.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => removeOne(d.id)}
                disabled={busy}
                className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
