import ShareInventoryButton, { type ShareChannelsAllowed } from "./ShareInventoryButton";
import SellerShareCopyButton from "./SellerShareCopyButton";
import SellerShareQrCode from "./SellerShareQrCode";

export interface InventorySharingStats {
  pageViews: number;
  shareClicks: number;
  whatsappClicks: number;
  phoneClicks: number;
  listingClicks: number;
}

export interface InventorySharingAnalyticsToggles {
  pageViews: boolean;
  shareCounts: boolean;
  whatsappClicks: boolean;
  phoneClicks: boolean;
  listingClicks: boolean;
}

export default function InventorySharingCard({
  canShare,
  blockedReason,
  slug,
  url,
  businessName,
  allowed,
  stats,
  analyticsToggles,
}: {
  canShare: boolean;
  blockedReason?: string;
  slug: string | null;
  url: string;
  businessName: string;
  allowed: ShareChannelsAllowed;
  stats: InventorySharingStats;
  analyticsToggles: InventorySharingAnalyticsToggles;
}) {
  if (!canShare || !slug) {
    return (
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Inventory Sharing</h2>
        <p className="mt-2 text-sm text-gray-600">
          {blockedReason ?? "Inventory sharing has been disabled by the site administrator."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Inventory Sharing</h2>
          <p className="mt-1 text-sm text-gray-500">Share this permanent link to your live inventory with buyers.</p>
        </div>
        <ShareInventoryButton slug={slug} url={url} businessName={businessName} allowed={allowed} />
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-700"
          />
          <SellerShareCopyButton slug={slug} url={url} />
        </div>
        <SellerShareQrCode url={url} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {analyticsToggles.pageViews && <Stat label="Page views" value={stats.pageViews} />}
        {analyticsToggles.shareCounts && <Stat label="Total shares" value={stats.shareClicks} />}
        {analyticsToggles.whatsappClicks && <Stat label="WhatsApp clicks" value={stats.whatsappClicks} />}
        {analyticsToggles.phoneClicks && <Stat label="Phone clicks" value={stats.phoneClicks} />}
        {analyticsToggles.listingClicks && <Stat label="Listing clicks" value={stats.listingClicks} />}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
