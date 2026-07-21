import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMWK, timeAgo } from "@/lib/format";
import { ensureSellerSubscriptionCurrent, daysRemaining, hasActiveAccess } from "@/lib/seller";
import DashboardListingActions from "@/components/DashboardListingActions";

export const metadata = { title: "Your dashboard · Halesah Galimoto Hub" };

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-brand-100 text-brand-800",
  SOLD: "bg-gray-200 text-gray-700",
  HIDDEN: "bg-gray-200 text-gray-700",
  PENDING_DELETION: "bg-red-100 text-red-700",
  DELETED: "bg-red-100 text-red-700",
  EXPIRED: "bg-amber-100 text-amber-800",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const account = user.sellerAccount;

  if (account) {
    await ensureSellerSubscriptionCurrent(account.id);
  }

  const freshAccount = account ? await prisma.sellerAccount.findUnique({ where: { id: account.id } }) : null;

  const [listings, notifications, payments] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: user.id },
      include: { _count: { select: { favorites: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 6 }),
    freshAccount
      ? prisma.subscriptionPayment.findMany({
          where: { sellerAccountId: freshAccount.id },
          include: { plan: true },
          orderBy: { submittedAt: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  const counts = {
    total: listings.length,
    active: listings.filter((l) => l.status === "ACTIVE").length,
    sold: listings.filter((l) => l.status === "SOLD").length,
    hidden: listings.filter((l) => l.status === "HIDDEN").length,
    pending: listings.filter((l) => l.status === "PENDING_APPROVAL").length,
  };
  const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
  const totalSaves = listings.reduce((sum, l) => sum + l._count.favorites, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Your dashboard</h1>
          <p className="mt-1 text-gray-600">{user.name ?? user.phone}</p>
        </div>
        {freshAccount && hasActiveAccess(freshAccount) && (
          <Link href="/sell" className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            + New listing
          </Link>
        )}
      </div>

      {!account && (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
          <h2 className="font-semibold text-ink">You&apos;re not a seller yet</h2>
          <p className="mt-2 text-sm text-gray-600">Apply for a seller account to start listing cars.</p>
          <Link href="/become-a-seller" className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            Become a seller
          </Link>
        </div>
      )}

      {freshAccount && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Seller status</p>
              <p className="mt-1 font-semibold text-ink">{SELLER_STATUS_LABELS[freshAccount.status]}</p>
            </div>
            {freshAccount.status === "APPROVED" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Subscription</p>
                <p className="mt-1 font-semibold text-ink">
                  {freshAccount.subscriptionStatus === "TRIAL" && `Free trial — ${daysRemaining(freshAccount.trialEndsAt)} day(s) left`}
                  {freshAccount.subscriptionStatus === "ACTIVE" &&
                    `Active — expires ${freshAccount.subscriptionExpiresAt?.toLocaleDateString() ?? ""}`}
                  {freshAccount.subscriptionStatus === "EXPIRED" && "Expired"}
                  {freshAccount.subscriptionStatus === "NONE" && "No subscription"}
                </p>
              </div>
            )}
            {freshAccount.status === "APPROVED" && !hasActiveAccess(freshAccount) && (
              <Link href="/dashboard/payment" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Submit payment
              </Link>
            )}
          </div>
          {freshAccount.status === "REJECTED" && freshAccount.rejectionReason && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Reason: {freshAccount.rejectionReason}</p>
          )}
        </div>
      )}

      {account && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCard label="Total listings" value={String(counts.total)} />
            <StatCard label="Active" value={String(counts.active)} />
            <StatCard label="Sold" value={String(counts.sold)} />
            <StatCard label="Hidden" value={String(counts.hidden)} />
            <StatCard label="Pending" value={String(counts.pending)} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <StatCard label="Total views" value={String(totalViews)} />
            <StatCard label="Total saves" value={String(totalSaves)} />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-ink">Recent activity</h2>
              {notifications.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">Nothing yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {notifications.map((n) => (
                    <li key={n.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                      <p className="font-medium text-ink">{n.title}</p>
                      <p className="text-gray-500">{n.body}</p>
                      <p className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-ink">Payment history</h2>
                <Link href="/dashboard/payment" className="text-sm font-medium text-brand-700 hover:underline">
                  Make a payment →
                </Link>
              </div>
              {payments.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">No payments submitted yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm">
                      <div>
                        <p className="font-medium text-ink">{formatMWK(p.amountMwk)}{p.plan ? ` · ${p.plan.name}` : ""}</p>
                        <p className="text-xs text-gray-400">{timeAgo(p.submittedAt)}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLES[p.status]}`}>{p.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {account && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-ink">Your listings</h2>
          {listings.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              You haven&apos;t listed a car yet.{" "}
              <Link href="/sell" className="font-medium text-brand-700 underline">
                List one now
              </Link>
              .
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div>
                    <Link href={`/marketplace/${listing.id}`} className="font-semibold text-ink hover:underline">
                      {listing.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {formatMWK(listing.priceMwk)} · Listed {timeAgo(listing.createdAt)} · {listing.viewCount} views ·{" "}
                      {listing._count.favorites} saves
                    </p>
                    {listing.status === "REJECTED" && listing.reviewNotes && (
                      <p className="mt-1 text-xs text-red-600">Feedback: {listing.reviewNotes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[listing.status]}`}>
                      {listing.status.replace(/_/g, " ")}
                    </span>
                    <DashboardListingActions listingId={listing.id} status={listing.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const SELLER_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-brand-100 text-brand-800",
  REJECTED: "bg-red-100 text-red-700",
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
