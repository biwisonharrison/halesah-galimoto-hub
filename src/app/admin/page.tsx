import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMWK, timeAgo } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [
    userCount,
    activeSellerCount,
    pendingSellerCount,
    trialSellerCount,
    paidSellerCount,
    expiredSellerCount,
    listingCounts,
    pendingReports,
    pendingDeletionRequests,
    recentPayments,
    recentRegistrations,
    topModels,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.sellerAccount.count({ where: { status: "APPROVED" } }),
    prisma.sellerAccount.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.sellerAccount.count({ where: { status: "APPROVED", subscriptionStatus: "TRIAL" } }),
    prisma.sellerAccount.count({ where: { status: "APPROVED", subscriptionStatus: "ACTIVE" } }),
    prisma.sellerAccount.count({ where: { status: "APPROVED", subscriptionStatus: "EXPIRED" } }),
    prisma.listing.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.listingDeletionRequest.count({ where: { status: "PENDING" } }),
    prisma.subscriptionPayment.findMany({
      include: { sellerAccount: true },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
    prisma.sellerAccount.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.listing.groupBy({
      by: ["brandName", "modelName"],
      _count: { _all: true },
      orderBy: { _count: { brandName: "desc" } },
      take: 5,
    }),
  ]);

  const countFor = (status: string) => listingCounts.find((l) => l.status === status)?._count._all ?? 0;
  const totalListings = listingCounts.reduce((sum, l) => sum + l._count._all, 0);

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Users & sellers</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total users" value={userCount} />
        <Stat label="Active sellers" value={activeSellerCount} />
        <Stat label="Pending approvals" value={pendingSellerCount} highlight={pendingSellerCount > 0} />
        <Stat label="Trial users" value={trialSellerCount} />
        <Stat label="Paid subscribers" value={paidSellerCount} />
        <Stat label="Expired subscriptions" value={expiredSellerCount} highlight={expiredSellerCount > 0} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-ink">Listings</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total" value={totalListings} />
        <Stat label="Active" value={countFor("ACTIVE")} />
        <Stat label="Pending" value={countFor("PENDING_APPROVAL")} highlight={countFor("PENDING_APPROVAL") > 0} />
        <Stat label="Hidden" value={countFor("HIDDEN")} />
        <Stat label="Sold" value={countFor("SOLD")} />
        <Stat label="Pending deletion" value={pendingDeletionRequests} highlight={pendingDeletionRequests > 0} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Pending reports" value={pendingReports} highlight={pendingReports > 0} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-ink">Recent payments</h2>
          {recentPayments.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No payments yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm">
                  <span className="text-ink">{p.sellerAccount.businessName}</span>
                  <span className="text-gray-500">{formatMWK(p.amountMwk)} · {p.status}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/payments" className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">
            View all payments →
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-ink">Recent registrations</h2>
          {recentRegistrations.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No seller applications yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentRegistrations.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm">
                  <span className="text-ink">{r.businessName}</span>
                  <span className="text-gray-500">{r.status.replace(/_/g, " ")} · {timeAgo(r.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/sellers" className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">
            Manage sellers →
          </Link>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-ink">Most listed models</h2>
      <p className="text-sm text-gray-500">Tells you what catalogue content and marketing to prioritise next.</p>
      <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {topModels.map((row) => (
          <div key={`${row.brandName}-${row.modelName}`} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-ink">
              {row.brandName} {row.modelName}
            </span>
            <span className="text-gray-500">{row._count._all} listing(s)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 text-center shadow-sm ${highlight ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}>
      <p className={`text-2xl font-bold ${highlight ? "text-amber-700" : "text-ink"}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
