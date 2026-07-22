"use client";

import { useState } from "react";
import type { CatalogProvider, ProviderConfig } from "./types";

export default function OtpProviderForm({
  catalog,
  channel,
  existing,
  onSaved,
  onCancel,
}: {
  catalog: CatalogProvider[];
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  existing?: ProviderConfig;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const channelProviders = catalog.filter((p) => p.channel === channel);
  const [providerKey, setProviderKey] = useState(existing?.providerKey ?? channelProviders[0]?.key ?? "");
  const [label, setLabel] = useState(existing?.label ?? "");
  const [environment, setEnvironment] = useState<"SANDBOX" | "PRODUCTION">(existing?.environment ?? "PRODUCTION");
  const [chainRole, setChainRole] = useState<"PRIMARY" | "BACKUP">(existing?.chainRole ?? "PRIMARY");
  const [priority, setPriority] = useState(existing?.priority ?? 0);
  const [credentials, setCredentials] = useState<Record<string, string>>(existing?.credentials ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const definition = channelProviders.find((p) => p.key === providerKey);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const cleanedCredentials = Object.fromEntries(
      Object.entries(credentials).filter(([, v]) => v && !v.startsWith("••••"))
    );

    const res = existing
      ? await fetch(`/api/developer/otp/providers/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", label, chainRole, priority, credentials: cleanedCredentials }),
        })
      : await fetch("/api/developer/otp/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerKey, channel, label: label || definition?.label, environment, chainRole, priority, credentials }),
        });

    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save this provider.");
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={save} className="mt-4 space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {!existing && (
          <label className="block text-sm">
            <span className="text-gray-300">Provider</span>
            <select
              value={providerKey}
              onChange={(e) => {
                setProviderKey(e.target.value);
                setCredentials({});
              }}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            >
              {channelProviders.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm">
          <span className="text-gray-300">Label</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={definition?.label}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
          />
        </label>
        {!existing && (
          <label className="block text-sm">
            <span className="text-gray-300">Environment</span>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as "SANDBOX" | "PRODUCTION")}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            >
              <option value="PRODUCTION">Production</option>
              <option value="SANDBOX">Sandbox</option>
            </select>
          </label>
        )}
        <label className="block text-sm">
          <span className="text-gray-300">Role in chain</span>
          <select
            value={chainRole}
            onChange={(e) => setChainRole(e.target.value as "PRIMARY" | "BACKUP")}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
          >
            <option value="PRIMARY">Primary</option>
            <option value="BACKUP">Backup</option>
          </select>
        </label>
        {chainRole === "BACKUP" && (
          <label className="block text-sm">
            <span className="text-gray-300">Backup priority (lower tries first)</span>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            />
          </label>
        )}
      </div>

      {definition?.notes && <p className="rounded-lg bg-amber-950/40 p-3 text-xs text-amber-300">{definition.notes}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {definition?.fields.map((field) => (
          <label key={field.key} className="block text-sm">
            <span className="text-gray-300">
              {field.label}
              {field.required && <span className="text-red-400"> *</span>}
            </span>
            {field.type === "select" ? (
              <select
                value={credentials[field.key] ?? field.defaultValue ?? ""}
                onChange={(e) => setCredentials((c) => ({ ...c, [field.key]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
              >
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
                value={credentials[field.key] ?? ""}
                onChange={(e) => setCredentials((c) => ({ ...c, [field.key]: e.target.value }))}
                placeholder={field.placeholder ?? field.defaultValue}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
              />
            )}
            {field.helpText && <span className="mt-1 block text-xs text-gray-500">{field.helpText}</span>}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Saving…" : "Save Configuration"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200">
          Cancel
        </button>
      </div>
    </form>
  );
}
