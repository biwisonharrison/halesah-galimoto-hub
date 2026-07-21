import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubmitPaymentForm from "@/components/SubmitPaymentForm";

export const metadata = { title: "Payment · Halesah Galimoto Hub" };

const TYPE_LABELS: Record<string, string> = {
  STANDARD_BANK: "Standard Bank",
  NATIONAL_BANK: "National Bank",
  MPAMBA: "Mpamba",
  AIRTEL_MONEY: "Airtel Money",
};

export default async function PaymentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard/payment");
  if (!user.sellerAccount) redirect("/become-a-seller");

  const [methods, plans] = await Promise.all([
    prisma.paymentMethod.findMany({ where: { enabled: true }, orderBy: [{ type: "asc" }, { sortOrder: "asc" }] }),
    prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { priceMwk: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">Subscription payment</h1>
      <p className="mt-2 text-gray-600">
        Pay using any of the methods below, then submit your proof of payment. An admin will confirm it and activate
        your subscription.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-semibold text-ink">Payment methods</h2>
          {methods.length === 0 ? (
            <p className="text-sm text-gray-500">No payment methods have been configured yet.</p>
          ) : (
            methods.map((method) => (
              <div key={method.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{TYPE_LABELS[method.type]}</p>
                <p className="mt-1 font-semibold text-ink">{method.label}</p>
                <dl className="mt-2 space-y-1 text-sm">
                  {method.accountName && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">{method.accountNumber ? "Account name" : "Registered name"}</dt>
                      <dd className="font-medium text-ink">{method.accountName}</dd>
                    </div>
                  )}
                  {method.accountNumber && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Account number</dt>
                      <dd className="font-medium text-ink">{method.accountNumber}</dd>
                    </div>
                  )}
                  {method.phoneNumber && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Phone number</dt>
                      <dd className="font-medium text-ink">{method.phoneNumber}</dd>
                    </div>
                  )}
                </dl>
                {method.instructions && <p className="mt-2 text-xs text-gray-500">{method.instructions}</p>}
              </div>
            ))
          )}
        </div>

        <SubmitPaymentForm
          plans={plans.map((p) => ({ id: p.id, name: p.name, priceMwk: p.priceMwk, durationDays: p.durationDays }))}
          methods={methods.map((m) => ({ id: m.id, label: `${TYPE_LABELS[m.type]} — ${m.label}` }))}
        />
      </div>
    </div>
  );
}
