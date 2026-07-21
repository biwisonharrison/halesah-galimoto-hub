import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import { timeAgo } from "@/lib/format";

export default async function DeveloperOverviewPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    settings,
    userCount,
    roleCounts,
    listingCounts,
    pageViews30d,
    searches30d,
    failedLogins7d,
    recentLogins,
    topSearches,
  ] = await Promise.all([
    getSiteSettings(),
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.listing.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.searchLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.loginAttempt.count({ where: { success: false, createdAt: { gte: sevenDaysAgo } } }),
    prisma.loginAttempt.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.searchLog.groupBy({
      by: ["query"],
      _count: { _all: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { query: "desc" } },
      take: 6,
    }),
  ]);

  const roleFor = (role: string) => roleCounts.find((r) => r.role === role)?._count._all ?? 0;
  const totalListings = listingCounts.reduce((sum, l) => sum + l._count._all, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Overview</h1>
      <p className="mt-1 text-sm text-gray-400">
        Live status of {settings.siteName}. Maintenance mode is{" "}
        <span className={settings.maintenanceMode ? "font-semibold text-amber-400" : "font-semibold text-emerald-400"}>
          {settings.maintenanceMode ? "ON" : "off"}
        </span>
        .
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-400">People</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total users" value={userCount} />
        <Stat label="Developers" value={roleFor("DEVELOPER")} />
        <Stat label="Admins" value={roleFor("ADMIN")} />
        <Stat label="Dealers" value={roleFor("DEALER")} />
        <Stat label="Sales agents" value={roleFor("SALES_AGENT")} />
        <Stat label="Moderators" value={roleFor("MODERATOR")} />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-400">Vehicles</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total listings" value={totalListings} />
        <Stat label="Active" value={listingCounts.find((l) => l.status === "ACTIVE")?._count._all ?? 0} />
        <Stat label="Pending approval" value={listingCounts.find((l) => l.status === "PENDING_APPROVAL")?._count._all ?? 0} />
        <Stat label="Reserved" value={listingCounts.find((l) => l.status === "RESERVED")?._count._all ?? 0} />
        <Stat label="Sold" value={listingCounts.find((l) => l.status === "SOLD")?._count._all ?? 0} />
        <Stat label="Archived" value={listingCounts.find((l) => l.status === "ARCHIVED")?._count._all ?? 0} />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-400">Traffic (last 30 days)</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Page views" value={pageViews30d} />
        <Stat label="Searches" value={searches30d} />
        <Stat label="Failed logins (7d)" value={failedLogins7d} highlight={failedLogins7d > 0} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Recent login attempts</h2>
          {recentLogins.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No login attempts logged yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentLogins.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm">
                  <span className="text-gray-200">{a.phone}</span>
                  <span className={a.success ? "text-emerald-400" : "text-red-400"}>
                    {a.success ? "success" : a.reason ?? "failed"} · {timeAgo(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Top searches (30 days)</h2>
          {topSearches.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No searches logged yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topSearches.map((s) => (
                <li key={s.query} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm">
                  <span className="text-gray-200">{s.query}</span>
                  <span className="text-gray-500">{s._count._all}×</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 text-center ${highlight ? "border-amber-500/40 bg-amber-500/10" : "border-gray-800 bg-gray-900"}`}>
      <p className={`text-2xl font-bold ${highlight ? "text-amber-400" : "text-white"}`}>{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
