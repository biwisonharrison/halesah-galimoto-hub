import { prisma } from "@/lib/prisma";
import { formatMWK } from "@/lib/format";
import { classifyBrowser, classifyDevice, referrerSource } from "@/lib/userAgent";
import BarChart from "@/components/developer/BarChart";

const DAYS = 14;

function dayKey(date: Date) {
  return date.toISOString().slice(5, 10);
}

function buildDailySeries(dates: Date[], days: number): { label: string; value: number }[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  const series: { label: string; value: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(dayKey(d), 0);
  }
  for (const date of dates) {
    const key = dayKey(date);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  for (const [label, value] of buckets) series.push({ label, value });
  return series;
}

export default async function AnalyticsPage() {
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

  const [pageViews, searchLogs, conversations, soldListings, popularVehicles, topSearches] = await Promise.all([
    prisma.pageView.findMany({ where: { createdAt: { gte: since } }, select: { path: true, ipAddress: true, userAgent: true, referrer: true, createdAt: true } }),
    prisma.searchLog.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.conversation.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.listing.findMany({ where: { status: "SOLD", updatedAt: { gte: since } }, select: { id: true } }),
    prisma.listing.findMany({ orderBy: { viewCount: "desc" }, take: 8, select: { id: true, title: true, viewCount: true, priceMwk: true } }),
    prisma.searchLog.groupBy({ by: ["query"], _count: { _all: true }, where: { createdAt: { gte: since } }, orderBy: { _count: { query: "desc" } }, take: 10 }),
  ]);

  const vehicleViews = pageViews.filter((p) => /^\/marketplace\/[^/]+$/.test(p.path));
  const uniqueVisitors = new Set(pageViews.map((p) => p.ipAddress ?? "unknown")).size;

  const pageViewSeries = buildDailySeries(pageViews.map((p) => p.createdAt), DAYS);
  const inquirySeries = buildDailySeries(conversations.map((c) => c.createdAt), DAYS);

  const browserCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();
  for (const p of pageViews) {
    const browser = classifyBrowser(p.userAgent);
    const device = classifyDevice(p.userAgent);
    const source = referrerSource(p.referrer);
    browserCounts.set(browser, (browserCounts.get(browser) ?? 0) + 1);
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-gray-400">Last {DAYS} days, based on real traffic recorded by the site.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Unique visitors" value={uniqueVisitors} hint="by IP address" />
        <Kpi label="Page views" value={pageViews.length} />
        <Kpi label="Vehicle views" value={vehicleViews.length} />
        <Kpi label="Inquiries" value={conversations.length} hint="new buyer↔seller chats" />
        <Kpi label="Conversions" value={soldListings.length} hint="listings marked sold" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Page views per day">
          <BarChart data={pageViewSeries} />
        </ChartCard>
        <ChartCard title="Inquiries per day">
          <BarChart data={inquirySeries} color="#38bdf8" />
        </ChartCard>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <BreakdownCard title="Traffic sources" counts={sourceCounts} />
        <BreakdownCard title="Devices" counts={deviceCounts} />
        <BreakdownCard title="Browsers" counts={browserCounts} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Top search terms</h2>
          {topSearches.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No searches logged in this window.</p>
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

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Most viewed vehicles (all time)</h2>
          {popularVehicles.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No listings yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {popularVehicles.map((v) => (
                <li key={v.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm">
                  <span className="text-gray-200">{v.title}</span>
                  <span className="text-gray-500">
                    {v.viewCount} views · {formatMWK(v.priceMwk)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-600">{hint}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      {children}
    </div>
  );
}

function BreakdownCard({ title, counts }: { title: string; counts: Map<string, number> }) {
  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map(([label, value]) => (
            <li key={label} className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{label}</span>
              <span className="text-gray-500">
                {value} ({Math.round((value / total) * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
