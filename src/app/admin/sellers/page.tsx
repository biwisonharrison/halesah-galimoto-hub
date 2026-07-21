import { prisma } from "@/lib/prisma";
import { daysRemaining } from "@/lib/seller";
import AdminCreateSellerForm from "@/components/AdminCreateSellerForm";
import AdminSellerActions from "@/components/AdminSellerActions";

const STATUS_STYLES: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  APPROVED: "bg-brand-100 text-brand-800",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-gray-200 text-gray-700",
};

export default async function AdminSellersPage() {
  const sellers = await prisma.sellerAccount.findMany({
    include: { user: true, _count: { select: { payments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminCreateSellerForm />

      <h2 className="mt-8 text-lg font-semibold text-ink">Sellers ({sellers.length})</h2>
      <div className="mt-4 space-y-3">
        {sellers.map((seller) => (
          <div key={seller.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="font-semibold text-ink">{seller.businessName}</p>
              <p className="text-sm text-gray-500">
                {seller.user.phone} · {seller.district ?? "No district"} · {seller._count.payments} payment(s)
              </p>
              {seller.status === "APPROVED" && (
                <p className="mt-1 text-xs text-gray-400">
                  {seller.subscriptionStatus === "TRIAL" && `Trial: ${daysRemaining(seller.trialEndsAt)} day(s) left`}
                  {seller.subscriptionStatus === "ACTIVE" && "Active subscription"}
                  {seller.subscriptionStatus === "EXPIRED" && "Subscription expired"}
                </p>
              )}
              {seller.status === "REJECTED" && seller.rejectionReason && (
                <p className="mt-1 text-xs text-red-600">Reason: {seller.rejectionReason}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[seller.status]}`}>
                {seller.status.replace(/_/g, " ")}
              </span>
              <AdminSellerActions sellerAccountId={seller.id} status={seller.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
