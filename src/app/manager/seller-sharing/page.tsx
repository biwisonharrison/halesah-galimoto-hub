import { prisma } from "@/lib/prisma";
import { getSellerSharingSettings } from "@/lib/sellerSharingSettings";
import SellerSharingGlobalToggle from "@/components/manager/SellerSharingGlobalToggle";
import SellerSharingTable from "@/components/manager/SellerSharingTable";

export default async function ManagerSellerSharingPage() {
  const [settings, sellers] = await Promise.all([
    getSellerSharingSettings(),
    prisma.sellerAccount.findMany({
      include: { user: { select: { phone: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const usingFeature = sellers.filter((s) => s.slug);
  const totalPageViews = sellers.reduce((sum, s) => sum + s.shareLinkPageViews, 0);
  const totalShares = sellers.reduce((sum, s) => sum + s.shareLinkShareClicks, 0);
  const disabledCount = sellers.filter((s) => s.sharingStatus !== "ENABLED").length;
  const mostViewed = [...sellers]
    .filter((s) => s.shareLinkPageViews > 0)
    .sort((a, b) => b.shareLinkPageViews - a.shareLinkPageViews)
    .slice(0, 5);
  const mostShared = [...sellers]
    .filter((s) => s.shareLinkShareClicks > 0)
    .sort((a, b) => b.shareLinkShareClicks - a.shareLinkShareClicks)
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Seller Inventory Sharing</h2>
      <p className="mt-1 text-sm text-gray-500">
        Manage the seller share-link feature without needing Developer Panel access.
      </p>

      <div className="mt-4">
        <SellerSharingGlobalToggle enabled={settings.enabled} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Sellers using feature" value={usingFeature.length} />
        <StatCard label="Total public pages" value={usingFeature.length} />
        <StatCard label="Total page views" value={totalPageViews} />
        <StatCard label="Total shares" value={totalShares} />
        <StatCard label="Sharing disabled" value={disabledCount} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <TopList title="Most viewed sellers" items={mostViewed.map((s) => ({ label: s.businessName, value: s.shareLinkPageViews }))} />
        <TopList title="Most shared sellers" items={mostShared.map((s) => ({ label: s.businessName, value: s.shareLinkShareClicks }))} />
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Sellers</h3>
        <SellerSharingTable
          urlPrefix={settings.urlPrefix}
          sellers={sellers.map((s) => ({
            id: s.id,
            businessName: s.businessName,
            phone: s.user.phone,
            slug: s.slug,
            sharingStatus: s.sharingStatus,
            shareLinkPageViews: s.shareLinkPageViews,
          }))}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function TopList({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-gray-400">No data yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {items.map((item) => (
            <li key={item.label} className="flex justify-between">
              <span className="text-ink">{item.label}</span>
              <span className="font-semibold text-gray-600">{item.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
