import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";
import SystemSettingsForm from "@/components/developer/SystemSettingsForm";

export default async function SystemSettingsPage() {
  const settings = await getSiteSettings();

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
          OTP delivery (SMS, WhatsApp, and email verification codes) is fully configured from the{" "}
          <Link href="/developer/otp" className="text-emerald-400 hover:underline">
            OTP Configuration
          </Link>{" "}
          page — providers, credentials, templates, rate limits, and delivery logs all live in the database there,
          not in environment variables.
        </p>
      </div>
    </div>
  );
}
