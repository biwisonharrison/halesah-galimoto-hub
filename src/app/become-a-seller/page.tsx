import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import BecomeSellerForm from "@/components/BecomeSellerForm";

export const metadata = { title: "Become a seller · Halesah Galimoto Hub" };

const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  PENDING_APPROVAL: {
    title: "Your application is under review",
    body: "Our team is reviewing your seller application. You'll be notified as soon as a decision is made.",
  },
  APPROVED: {
    title: "You're already an approved seller",
    body: "Head to your dashboard to create and manage listings.",
  },
  REJECTED: {
    title: "Your application was not approved",
    body: "Contact support if you'd like to understand why or reapply with updated details.",
  },
  SUSPENDED: {
    title: "Your seller account is suspended",
    body: "Contact support to find out how to reactivate your account.",
  },
};

export default async function BecomeASellerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/become-a-seller");

  const existingStatus = user.sellerAccount?.status;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-ink">Become a seller</h1>
      <p className="mt-2 text-sm text-gray-600">
        Apply for a seller account to list cars on Halesah Galimoto Hub. Every approved seller gets a free 30-day trial.
      </p>

      <div className="mt-8">
        {existingStatus ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-ink">{STATUS_MESSAGES[existingStatus]?.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{STATUS_MESSAGES[existingStatus]?.body}</p>
            {user.sellerAccount?.rejectionReason && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Reason: {user.sellerAccount.rejectionReason}
              </p>
            )}
          </div>
        ) : (
          <BecomeSellerForm />
        )}
      </div>
    </div>
  );
}
