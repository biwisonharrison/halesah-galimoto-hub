"use client";

import { useCallback, useEffect, useState } from "react";
import type { CatalogProvider, ProviderConfig, OtpSettingsData } from "./types";
import OtpProvidersTab from "./OtpProvidersTab";
import OtpSettingsTab from "./OtpSettingsTab";
import OtpEnforcementTab from "./OtpEnforcementTab";
import OtpTemplatesTab from "./OtpTemplatesTab";
import OtpTestTab from "./OtpTestTab";
import OtpLogsTab from "./OtpLogsTab";

const TABS = [
  { key: "providers", label: "Providers" },
  { key: "settings", label: "OTP & Rate Limiting" },
  { key: "enforcement", label: "Enforcement & Devices" },
  { key: "templates", label: "Templates" },
  { key: "test", label: "Test Configuration" },
  { key: "logs", label: "Delivery Logs" },
] as const;

export default function OtpConfigurationPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("providers");
  const [catalog, setCatalog] = useState<CatalogProvider[] | null>(null);
  const [providers, setProviders] = useState<ProviderConfig[] | null>(null);
  const [settings, setSettings] = useState<OtpSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalogRes, providersRes, settingsRes] = await Promise.all([
        fetch("/api/developer/otp/catalog"),
        fetch("/api/developer/otp/providers"),
        fetch("/api/developer/otp/settings"),
      ]);
      if (!catalogRes.ok || !providersRes.ok || !settingsRes.ok) throw new Error("Failed to load OTP configuration.");
      const [catalogData, providersData, settingsData] = await Promise.all([catalogRes.json(), providersRes.json(), settingsRes.json()]);
      setCatalog(catalogData.providers);
      setProviders(providersData.providers);
      setSettings(settingsData.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load OTP configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) return <p className="text-sm text-gray-400">Loading OTP configuration…</p>;
  if (error || !catalog || !providers || !settings) {
    return <p className="text-sm text-red-400">{error ?? "Something went wrong loading OTP configuration."}</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <span className={`h-2.5 w-2.5 rounded-full ${settings.otpEnabled ? "bg-emerald-400" : "bg-red-400"}`} />
        <p className="text-sm text-gray-200">
          OTP verification is <span className="font-semibold">{settings.otpEnabled ? "enabled" : "disabled"}</span> site-wide.
          Toggle it from the OTP &amp; Rate Limiting tab.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === t.key ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "providers" && <OtpProvidersTab catalog={catalog} providers={providers} onChanged={reload} />}
        {tab === "settings" && <OtpSettingsTab settings={settings} onChanged={reload} />}
        {tab === "enforcement" && <OtpEnforcementTab />}
        {tab === "templates" && <OtpTemplatesTab />}
        {tab === "test" && <OtpTestTab providers={providers} />}
        {tab === "logs" && <OtpLogsTab providers={providers} />}
      </div>
    </div>
  );
}
