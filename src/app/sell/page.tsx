import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureSellerSubscriptionCurrent, hasActiveAccess, daysRemaining } from "@/lib/seller";
import { prisma } from "@/lib/prisma";
import SellWizard from "@/components/SellWizard";

export const metadata = { title: "Sell your car · Halesah Galimoto Hub" };

export default async function SellPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/sell");

  if (!user.sellerAccount && (user.role === "ADMIN" || user.role === "DEVELOPER")) {
    await prisma.sellerAccount.create({
      data: {
        userId: user.id,
        businessName: "Halesah Galimoto Hub (internal listings)",
        status: "APPROVED",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      },
    });
    redirect("/sell");
  }

  if (!user.sellerAccount) {
    return (
      <GateMessage
        title="Become a seller to list cars"
        body="Listing cars requires an approved seller account. It only takes a minute to apply, and every approved seller gets a free 30-day trial."
        ctaHref="/become-a-seller"
        ctaLabel="Apply to become a seller"
      />
    );
  }

  if (user.sellerAccount.status === "PENDING_APPROVAL") {
    return (
      <GateMessage
        title="Your seller application is under review"
        body="You'll be able to create listings as soon as our team approves your application."
      />
    );
  }

  if (user.sellerAccount.status === "REJECTED") {
    return (
      <GateMessage
        title="Your seller application was not approved"
        body={user.sellerAccount.rejectionReason ?? "Contact support for more details."}
      />
    );
  }

  if (user.sellerAccount.status === "SUSPENDED") {
    return <GateMessage title="Your seller account is suspended" body="Contact support to reactivate your account." />;
  }

  await ensureSellerSubscriptionCurrent(user.sellerAccount.id);
  const account = await prisma.sellerAccount.findUniqueOrThrow({ where: { id: user.sellerAccount.id } });

  if (!hasActiveAccess(account)) {
    return (
      <GateMessage
        title="Your free trial has ended"
        body="Submit a subscription payment to keep creating and reactivate listings."
        ctaHref="/dashboard/payment"
        ctaLabel="Go to payment page"
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">Sell your car</h1>
      <p className="mt-2 text-gray-600">
        {account.subscriptionStatus === "TRIAL"
          ? `${daysRemaining(account.trialEndsAt)} day(s) left in your free trial. `
          : ""}
        Save as a draft anytime, or submit for approval when it's ready to go live.
      </p>
      <div className="mt-8">
        <SellWizard />
      </div>
    </div>
  );
}

function GateMessage({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{body}</p>
        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
