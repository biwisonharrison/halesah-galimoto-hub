"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Settings = {
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  address: string | null;
  companyName: string | null;
  registrationNumber: string | null;
  currency: string;
  timezone: string;
  taxRatePercent: number | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUsername: string | null;
  smtpPassword: string | null;
  smtpFromEmail: string | null;
  notifyEmailEnabled: boolean;
  notifyWhatsappEnabled: boolean;
};

function toFormState(s: Settings) {
  return {
    contactEmail: s.contactEmail ?? "",
    contactPhone: s.contactPhone ?? "",
    whatsappNumber: s.whatsappNumber ?? "",
    address: s.address ?? "",
    companyName: s.companyName ?? "",
    registrationNumber: s.registrationNumber ?? "",
    currency: s.currency,
    timezone: s.timezone,
    taxRatePercent: s.taxRatePercent?.toString() ?? "",
    maintenanceMode: s.maintenanceMode,
    maintenanceMessage: s.maintenanceMessage ?? "",
    facebookUrl: s.facebookUrl ?? "",
    twitterUrl: s.twitterUrl ?? "",
    instagramUrl: s.instagramUrl ?? "",
    tiktokUrl: s.tiktokUrl ?? "",
    smtpHost: s.smtpHost ?? "",
    smtpPort: s.smtpPort?.toString() ?? "",
    smtpUsername: s.smtpUsername ?? "",
    smtpPassword: s.smtpPassword ?? "",
    smtpFromEmail: s.smtpFromEmail ?? "",
    notifyEmailEnabled: s.notifyEmailEnabled,
    notifyWhatsappEnabled: s.notifyWhatsappEnabled,
  };
}

export default function SystemSettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(toFormState(settings));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/developer/settings/system", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        taxRatePercent: form.taxRatePercent === "" ? null : Number(form.taxRatePercent),
        smtpPort: form.smtpPort === "" ? null : Number(form.smtpPort),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save settings.");
      return;
    }
    setSuccess("Saved.");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <Section title="Company details">
        <Grid>
          <Field label="Company name">
            <Text value={form.companyName} onChange={(v) => set("companyName", v)} />
          </Field>
          <Field label="Registration number">
            <Text value={form.registrationNumber} onChange={(v) => set("registrationNumber", v)} />
          </Field>
          <Field label="Contact email">
            <Text value={form.contactEmail} onChange={(v) => set("contactEmail", v)} type="email" />
          </Field>
          <Field label="Contact phone">
            <Text value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
          </Field>
          <Field label="WhatsApp number">
            <Text value={form.whatsappNumber} onChange={(v) => set("whatsappNumber", v)} />
          </Field>
          <Field label="Address">
            <Text value={form.address} onChange={(v) => set("address", v)} />
          </Field>
        </Grid>
      </Section>

      <Section title="Currency, timezone & tax">
        <Grid>
          <Field label="Currency code">
            <Text value={form.currency} onChange={(v) => set("currency", v)} />
          </Field>
          <Field label="Timezone">
            <Text value={form.timezone} onChange={(v) => set("timezone", v)} />
          </Field>
          <Field label="Tax rate (%)">
            <Text value={form.taxRatePercent} onChange={(v) => set("taxRatePercent", v)} type="number" />
          </Field>
        </Grid>
      </Section>

      <Section title="Notifications">
        <div className="flex flex-wrap gap-6">
          <Toggle label="Email notifications" checked={form.notifyEmailEnabled} onChange={(v) => set("notifyEmailEnabled", v)} />
          <Toggle label="WhatsApp notifications" checked={form.notifyWhatsappEnabled} onChange={(v) => set("notifyWhatsappEnabled", v)} />
        </div>
      </Section>

      <Section title="SMTP (outgoing email)">
        <p className="mb-3 text-xs text-gray-500">Stored as plain text in the database — don't reuse a sensitive password here.</p>
        <Grid>
          <Field label="SMTP host">
            <Text value={form.smtpHost} onChange={(v) => set("smtpHost", v)} />
          </Field>
          <Field label="SMTP port">
            <Text value={form.smtpPort} onChange={(v) => set("smtpPort", v)} type="number" />
          </Field>
          <Field label="SMTP username">
            <Text value={form.smtpUsername} onChange={(v) => set("smtpUsername", v)} />
          </Field>
          <Field label="SMTP password">
            <Text value={form.smtpPassword} onChange={(v) => set("smtpPassword", v)} type="password" />
          </Field>
          <Field label="From email">
            <Text value={form.smtpFromEmail} onChange={(v) => set("smtpFromEmail", v)} type="email" />
          </Field>
        </Grid>
      </Section>

      <Section title="Social links">
        <Grid>
          <Field label="Facebook">
            <Text value={form.facebookUrl} onChange={(v) => set("facebookUrl", v)} />
          </Field>
          <Field label="Twitter / X">
            <Text value={form.twitterUrl} onChange={(v) => set("twitterUrl", v)} />
          </Field>
          <Field label="Instagram">
            <Text value={form.instagramUrl} onChange={(v) => set("instagramUrl", v)} />
          </Field>
          <Field label="TikTok">
            <Text value={form.tiktokUrl} onChange={(v) => set("tiktokUrl", v)} />
          </Field>
        </Grid>
      </Section>

      <Section title="Maintenance mode">
        <Toggle label="Site is in maintenance mode" checked={form.maintenanceMode} onChange={(v) => set("maintenanceMode", v)} />
        {form.maintenanceMode && (
          <p className="mt-2 text-xs text-amber-400">
            Only Developer and Administrator accounts will be able to browse the site while this is on.
          </p>
        )}
        <div className="mt-3">
          <Field label="Maintenance message">
            <textarea
              value={form.maintenanceMessage}
              onChange={(e) => set("maintenanceMessage", e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            />
          </Field>
        </div>
      </Section>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">{success}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function Text({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
    />
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}
