import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";
import SystemSettingsForm from "@/components/developer/SystemSettingsForm";

export default async function SystemSettingsPage() {
  const settings = await getSiteSettings();
  const otpProvider = process.env.OTP_PROVIDER ?? "console";
  const africasTalkingConfigured = Boolean(process.env.AFRICASTALKING_API_KEY);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">System settings</h1>
      <p className="mt-1 text-sm text-gray-400">
        Company details, currency &amp; tax, notifications, SMTP, social links, and maintenance mode. Branding and
        colors live on the{" "}
        <Link href="/developer/customization" className="text-emerald-400 hover:underline">
          Site customization
        </Link>{" "}
        page.
      </p>

      <div className="mt-6">
        <SystemSettingsForm
          settings={{
            contactEmail: settings.contactEmail,
            contactPhone: settings.contactPhone,
            whatsappNumber: settings.whatsappNumber,
            address: settings.address,
            companyName: settings.companyName,
            registrationNumber: settings.registrationNumber,
            currency: settings.currency,
            timezone: settings.timezone,
            taxRatePercent: settings.taxRatePercent,
            maintenanceMode: settings.maintenanceMode,
            maintenanceMessage: settings.maintenanceMessage,
            facebookUrl: settings.facebookUrl,
            twitterUrl: settings.twitterUrl,
            instagramUrl: settings.instagramUrl,
            tiktokUrl: settings.tiktokUrl,
            smtpHost: settings.smtpHost,
            smtpPort: settings.smtpPort,
            smtpUsername: settings.smtpUsername,
            smtpPassword: settings.smtpPassword,
            smtpFromEmail: settings.smtpFromEmail,
            notifyEmailEnabled: settings.notifyEmailEnabled,
            notifyWhatsappEnabled: settings.notifyWhatsappEnabled,
          }}
        />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gray-400">Payment methods</h2>
      <p className="mt-2 text-sm text-gray-400">
        Bank and mobile money accounts sellers pay subscriptions to are managed on the{" "}
        <Link href="/admin/payment-settings" className="text-emerald-400 hover:underline">
          admin payment settings
        </Link>{" "}
        page.
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gray-400">API keys &amp; integrations</h2>
      <div className="mt-2 rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-300">
        <p>
          OTP delivery provider: <span className="font-medium text-white">{otpProvider}</span>
          {otpProvider === "africastalking" && (
            <span className={africasTalkingConfigured ? "ml-2 text-emerald-400" : "ml-2 text-red-400"}>
              ({africasTalkingConfigured ? "API key configured" : "API key missing"})
            </span>
          )}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          SMS and other third-party API keys are set via environment variables (<code>.env</code>) on the server, not
          through this page — that keeps them out of the database and out of anything a browser ever loads. Ask
          whoever manages the server to update <code>.env</code> and restart the app to change them.
        </p>
      </div>
    </div>
  );
}
