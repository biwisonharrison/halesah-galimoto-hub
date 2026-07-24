"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Settings = {
  enabled: boolean;
  allowCopyLink: boolean;
  allowWhatsappShare: boolean;
  allowFacebookShare: boolean;
  allowTwitterShare: boolean;
  allowTelegramShare: boolean;
  allowEmailShare: boolean;
  allowNativeShare: boolean;
  urlPrefix: string;
  slugFormat: string;
  fallbackUrl: string;
  disabledMessage: string;
  seoIndexing: boolean;
  seoSitemap: boolean;
  seoStructuredData: boolean;
  seoOpenGraph: boolean;
  seoTwitterCard: boolean;
  analyticsPageViews: boolean;
  analyticsListingClicks: boolean;
  analyticsPhoneClicks: boolean;
  analyticsWhatsappClicks: boolean;
  analyticsShareCounts: boolean;
  securityRequireVerification: boolean;
  securityHideLocation: boolean;
  securityHidePhone: boolean;
  securityHideWhatsapp: boolean;
  securityRateLimitEnabled: boolean;
  securityRateLimitPerMinute: number;
};

export default function SellerSharingSettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/developer/seller-sharing/settings", {
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
    setSuccess("Saved. Changes apply immediately, no restart needed.");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <Section title="Master Feature Switch">
          <Toggle
            label="Enable Seller Inventory Sharing"
            checked={form.enabled}
            onChange={(v) => update("enabled", v)}
          />
          <p className="text-xs text-gray-500">
            Also drives "Allow public seller pages" in Security below — the same switch, shown in both places.
          </p>
        </Section>

        <Section title="Allow Social Sharing">
          <Toggle label="Copy Link" checked={form.allowCopyLink} onChange={(v) => update("allowCopyLink", v)} />
          <Toggle label="WhatsApp" checked={form.allowWhatsappShare} onChange={(v) => update("allowWhatsappShare", v)} />
          <Toggle label="Facebook" checked={form.allowFacebookShare} onChange={(v) => update("allowFacebookShare", v)} />
          <Toggle label="X (Twitter)" checked={form.allowTwitterShare} onChange={(v) => update("allowTwitterShare", v)} />
          <Toggle label="Telegram" checked={form.allowTelegramShare} onChange={(v) => update("allowTelegramShare", v)} />
          <Toggle label="Email" checked={form.allowEmailShare} onChange={(v) => update("allowEmailShare", v)} />
          <Toggle label="Native Device Share" checked={form.allowNativeShare} onChange={(v) => update("allowNativeShare", v)} />
        </Section>

        <Section title="URL Configuration">
          <Field label="URL prefix">
            <input
              value={form.urlPrefix}
              onChange={(e) => update("urlPrefix", e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
              placeholder="seller"
            />
          </Field>
          <Field label="Slug format">
            <select
              value={form.slugFormat}
              onChange={(e) => update("slugFormat", e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            >
              <option value="BUSINESS_NAME">Business name</option>
              <option value="BUSINESS_NAME_SHORT_ID">Business name + short ID</option>
            </select>
          </Field>
          <Field label="Default fallback URL">
            <input
              value={form.fallbackUrl}
              onChange={(e) => update("fallbackUrl", e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            />
          </Field>
          <Field label="Disabled-feature message">
            <textarea
              value={form.disabledMessage}
              onChange={(e) => update("disabledMessage", e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
            />
          </Field>
        </Section>

        <Section title="SEO Controls">
          <Toggle label="Search engine indexing" checked={form.seoIndexing} onChange={(v) => update("seoIndexing", v)} />
          <Toggle label="Sitemap inclusion" checked={form.seoSitemap} onChange={(v) => update("seoSitemap", v)} />
          <Toggle label="Structured data" checked={form.seoStructuredData} onChange={(v) => update("seoStructuredData", v)} />
          <Toggle label="Open Graph tags" checked={form.seoOpenGraph} onChange={(v) => update("seoOpenGraph", v)} />
          <Toggle label="Twitter/X Cards" checked={form.seoTwitterCard} onChange={(v) => update("seoTwitterCard", v)} />
        </Section>

        <Section title="Analytics">
          <Toggle label="Page views" checked={form.analyticsPageViews} onChange={(v) => update("analyticsPageViews", v)} />
          <Toggle
            label="Listing clicks"
            checked={form.analyticsListingClicks}
            onChange={(v) => update("analyticsListingClicks", v)}
          />
          <Toggle label="Phone clicks" checked={form.analyticsPhoneClicks} onChange={(v) => update("analyticsPhoneClicks", v)} />
          <Toggle
            label="WhatsApp clicks"
            checked={form.analyticsWhatsappClicks}
            onChange={(v) => update("analyticsWhatsappClicks", v)}
          />
          <Toggle label="Share counts" checked={form.analyticsShareCounts} onChange={(v) => update("analyticsShareCounts", v)} />
        </Section>

        <Section title="Security">
          <Toggle
            label="Require seller verification before sharing"
            checked={form.securityRequireVerification}
            onChange={(v) => update("securityRequireVerification", v)}
          />
          <Toggle label="Hide seller location" checked={form.securityHideLocation} onChange={(v) => update("securityHideLocation", v)} />
          <Toggle label="Hide phone number" checked={form.securityHidePhone} onChange={(v) => update("securityHidePhone", v)} />
          <Toggle label="Hide WhatsApp button" checked={form.securityHideWhatsapp} onChange={(v) => update("securityHideWhatsapp", v)} />
          <Toggle
            label="Allow public seller pages"
            checked={form.enabled}
            onChange={(v) => update("enabled", v)}
          />
          <Toggle
            label="Prevent indexing by search engines"
            checked={!form.seoIndexing}
            onChange={(v) => update("seoIndexing", !v)}
          />
          <Toggle
            label="Rate limit requests to seller pages"
            checked={form.securityRateLimitEnabled}
            onChange={(v) => update("securityRateLimitEnabled", v)}
          />
          {form.securityRateLimitEnabled && (
            <Field label="Requests per minute per visitor">
              <input
                type="number"
                min={1}
                max={1000}
                value={form.securityRateLimitPerMinute}
                onChange={(e) => update("securityRateLimitPerMinute", Number(e.target.value))}
                className="w-32 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
              />
            </Field>
          )}
        </Section>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Preview</p>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-xs text-gray-500">Example seller URL</p>
          <p className="mt-1 break-all font-mono text-sm text-emerald-400">/{form.urlPrefix || "seller"}/example-motors</p>
          <p className="mt-4 text-xs text-gray-500">Feature status</p>
          <p className={`mt-1 text-sm font-semibold ${form.enabled ? "text-emerald-400" : "text-red-400"}`}>
            {form.enabled ? "Enabled" : "Disabled — sellers can't share, existing links show the disabled message"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-gray-800 pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      <div className="space-y-2">{children}</div>
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}
