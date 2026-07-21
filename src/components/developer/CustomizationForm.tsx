"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Lato",
  "Open Sans",
  "Nunito",
  "Raleway",
  "Merriweather",
  "Playfair Display",
];

type Settings = {
  siteName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
};

export default function CustomizationForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    siteName: settings.siteName,
    tagline: settings.tagline ?? "",
    logoUrl: settings.logoUrl ?? "",
    faviconUrl: settings.faviconUrl ?? "",
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    fontFamily: settings.fontFamily,
  });
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState<"undo" | "reset" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetToLoaded() {
    setForm({
      siteName: settings.siteName,
      tagline: settings.tagline ?? "",
      logoUrl: settings.logoUrl ?? "",
      faviconUrl: settings.faviconUrl ?? "",
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      fontFamily: settings.fontFamily,
    });
    setError(null);
    setSuccess(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/developer/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save changes.");
      return;
    }
    setSuccess("Published. The live site now reflects these changes.");
    router.refresh();
  }

  async function handleUndo() {
    setBusyAction("undo");
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/developer/settings/undo", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusyAction(null);
    if (!res.ok) {
      setError(data.error ?? "Nothing to undo.");
      return;
    }
    setSuccess("Reverted to the previous version.");
    router.refresh();
  }

  async function handleResetDefaults() {
    if (!confirm("Reset all branding to the factory defaults? This can be undone from version history.")) return;
    setBusyAction("reset");
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/developer/settings/reset", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusyAction(null);
    if (!res.ok) {
      setError(data.error ?? "Could not reset settings.");
      return;
    }
    setSuccess("Restored factory defaults.");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <Field label="Site name">
          <input
            value={form.siteName}
            onChange={(e) => update("siteName", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            maxLength={80}
          />
        </Field>

        <Field label="Tagline">
          <input
            value={form.tagline}
            onChange={(e) => update("tagline", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            maxLength={160}
            placeholder="Malawi's online home for cars"
          />
        </Field>

        <Field label="Logo URL">
          <input
            value={form.logoUrl}
            onChange={(e) => update("logoUrl", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            placeholder="https://…"
          />
        </Field>

        <Field label="Favicon URL">
          <input
            value={form.faviconUrl}
            onChange={(e) => update("faviconUrl", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            placeholder="https://…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="h-9 w-12 rounded border border-gray-700 bg-gray-950"
              />
              <input
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
              />
            </div>
          </Field>
          <Field label="Secondary color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => update("secondaryColor", e.target.value)}
                className="h-9 w-12 rounded border border-gray-700 bg-gray-950"
              />
              <input
                value={form.secondaryColor}
                onChange={(e) => update("secondaryColor", e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
              />
            </div>
          </Field>
        </div>

        <Field label="Font">
          <select
            value={form.fontFamily}
            onChange={(e) => update("fontFamily", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving ? "Publishing…" : "Publish changes"}
          </button>
          <button onClick={resetToLoaded} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800">
            Cancel edits
          </button>
          <button
            onClick={handleUndo}
            disabled={busyAction === "undo"}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-60"
          >
            Undo last change
          </button>
          <button
            onClick={handleResetDefaults}
            disabled={busyAction === "reset"}
            className="rounded-lg border border-red-900 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950 disabled:opacity-60"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Live preview</p>
        <div
          className="overflow-hidden rounded-2xl border border-gray-800"
          style={{ fontFamily: `${form.fontFamily}, ui-sans-serif` }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center gap-2">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: form.secondaryColor }}
                >
                  {initials(form.siteName)}
                </span>
              )}
              <span className="font-bold" style={{ color: form.secondaryColor }}>
                {form.siteName || "Site name"}
              </span>
            </div>
            <button
              className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
              style={{ backgroundColor: form.primaryColor }}
            >
              Sell your car
            </button>
          </div>
          <div className="space-y-2 px-5 py-8" style={{ backgroundColor: "#f8fafc" }}>
            <p className="text-2xl font-bold" style={{ color: form.secondaryColor }}>
              {form.siteName || "Site name"}
            </p>
            <p className="text-sm text-gray-600">{form.tagline || "Your tagline will appear here."}</p>
            <button
              className="mt-3 rounded-full px-5 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: form.primaryColor }}
            >
              Browse cars
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          This preview updates instantly as you type. Nothing changes on the live site until you click “Publish changes”.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}
