import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ChangePhoneForm from "@/components/ChangePhoneForm";
import ChangeEmailForm from "@/components/ChangeEmailForm";
import TrustedDevicesManager from "@/components/TrustedDevicesManager";

export const metadata = { title: "Account settings · Halesah Galimoto Hub" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-ink">Account settings</h1>
      <p className="mt-2 text-sm text-gray-600">Update your login phone number or email address.</p>

      <div className="mt-8 space-y-8">
        <ChangePhoneForm currentPhone={user.phone} />
        <ChangeEmailForm currentEmail={user.email} />
        <TrustedDevicesManager />
      </div>
    </div>
  );
}
