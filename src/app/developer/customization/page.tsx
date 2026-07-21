import { getSiteSettings } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";
import CustomizationForm from "@/components/developer/CustomizationForm";
import HistoryRestoreButton from "@/components/developer/HistoryRestoreButton";

export default async function CustomizationPage() {
  const [settings, history] = await Promise.all([
    getSiteSettings(),
    prisma.siteSettingsHistory.findMany({
      include: { changedBy: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Site customization</h1>
      <p className="mt-1 text-sm text-gray-400">
        Edit branding and see a live preview before publishing. Every publish is saved to version history below.
      </p>

      <div className="mt-6">
        <CustomizationForm
          key={settings.updatedAt.toISOString()}
          settings={{
            siteName: settings.siteName,
            tagline: settings.tagline,
            logoUrl: settings.logoUrl,
            faviconUrl: settings.faviconUrl,
            primaryColor: settings.primaryColor,
            secondaryColor: settings.secondaryColor,
            fontFamily: settings.fontFamily,
          }}
        />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gray-400">Version history</h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No changes published yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {history.map((h) => {
            const snapshot = h.snapshot as { siteName?: string };
            return (
              <li key={h.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm">
                <span className="text-gray-300">
                  {snapshot.siteName ?? "Settings snapshot"} · saved by {h.changedBy?.name ?? h.changedBy?.phone ?? "unknown"} ·{" "}
                  {timeAgo(h.createdAt)}
                </span>
                <HistoryRestoreButton historyId={h.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
