import { prisma } from "@/lib/prisma";
import { formatMWK, timeAgo } from "@/lib/format";
import AdminPaymentActions from "@/components/AdminPaymentActions";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-brand-100 text-brand-800",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function AdminPaymentsPage() {
  const payments = await prisma.subscriptionPayment.findMany({
    include: { sellerAccount: { include: { user: true } }, plan: true, paymentMethod: true },
    orderBy: { submittedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Payments ({payments.length})</h2>
      <div className="mt-4 space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="font-semibold text-ink">
                {p.sellerAccount.businessName} · {formatMWK(p.amountMwk)}
                {p.plan ? ` (${p.plan.name})` : ""}
              </p>
              <p className="text-sm text-gray-500">
                {p.sellerAccount.user.phone} · {p.paymentMethod?.label ?? "Unspecified method"} · {timeAgo(p.submittedAt)}
              </p>
              <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-700 underline">
                View proof of payment
              </a>
              {p.notes && <p className="mt-1 text-sm text-gray-500">&quot;{p.notes}&quot;</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}>{p.status}</span>
              {p.status === "PENDING" && <AdminPaymentActions paymentId={p.id} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
