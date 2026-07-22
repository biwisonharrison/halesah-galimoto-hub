import OtpConfigurationPanel from "@/components/developer/otp/OtpConfigurationPanel";

export const metadata = { title: "OTP Configuration · Developer panel" };

export default function OtpConfigurationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">OTP Configuration</h1>
      <p className="mt-1 text-sm text-gray-400">
        Everything about how one-time passwords are sent and verified — providers, credentials, delivery channels,
        templates, rate limits, and logs — lives here in the database. Nothing is hardcoded in the source code.
      </p>

      <div className="mt-6">
        <OtpConfigurationPanel />
      </div>
    </div>
  );
}
