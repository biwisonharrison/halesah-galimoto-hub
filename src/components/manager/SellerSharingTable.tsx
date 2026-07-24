"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ManagedSeller {
  id: string;
  businessName: string;
  phone: string;
  slug: string | null;
  sharingStatus: "ENABLED" | "DISABLED" | "SUSPENDED";
  shareLinkPageViews: number;
}

const STATUS_STYLES: Record<ManagedSeller["sharingStatus"], string> = {
  ENABLED: "bg-brand-100 text-brand-800",
  DISABLED: "bg-gray-200 text-gray-700",
  SUSPENDED: "bg-red-100 text-red-700",
};

export default function SellerSharingTable({ urlPrefix, sellers }: { urlPrefix: string; sellers: ManagedSeller[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === sellers.length ? new Set() : new Set(sellers.map((s) => s.id))));
  }

  async function perSellerAction(id: string, action: "enable" | "disable" | "suspend" | "restore") {
    setBusy(true);
    await fetch(`/api/manager/seller-sharing/sellers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  async function bulkAction(action: "enable" | "disable", all: boolean) {
    if (!all && selected.size === 0) return;
    setBusy(true);
    await fetch("/api/manager/seller-sharing/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(all ? { action, all: true } : { action, sellerIds: Array.from(selected) }),
    });
    setBusy(false);
    setSelected(new Set());
    router.refresh();
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/${urlPrefix}/${slug}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          disabled={busy || selected.size === 0}
          onClick={() => bulkAction("enable", false)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-gray-50 disabled:opacity-50"
        >
          Enable selected
        </button>
        <button
          disabled={busy || selected.size === 0}
          onClick={() => bulkAction("disable", false)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-gray-50 disabled:opacity-50"
        >
          Disable selected
        </button>
        <button
          disabled={busy}
          onClick={() => bulkAction("enable", true)}
          className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          Enable sharing for all sellers
        </button>
        <button
          disabled={busy}
          onClick={() => bulkAction("disable", true)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Disable sharing for all sellers
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-10 px-3 py-2">
                <input type="checkbox" checked={selected.size === sellers.length && sellers.length > 0} onChange={toggleSelectAll} />
              </th>
              <th className="px-3 py-2">Seller</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Page views</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selected.has(seller.id)} onChange={() => toggleSelected(seller.id)} />
                </td>
                <td className="px-3 py-2">
                  <p className="font-medium text-ink">{seller.businessName}</p>
                  <p className="text-xs text-gray-500">{seller.phone}</p>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[seller.sharingStatus]}`}>
                    {seller.sharingStatus}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600">{seller.shareLinkPageViews}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {seller.sharingStatus !== "ENABLED" && (
                      <button
                        disabled={busy}
                        onClick={() => perSellerAction(seller.id, seller.sharingStatus === "SUSPENDED" ? "restore" : "enable")}
                        className="rounded-md border border-brand-300 px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                      >
                        {seller.sharingStatus === "SUSPENDED" ? "Restore" : "Enable"}
                      </button>
                    )}
                    {seller.sharingStatus === "ENABLED" && (
                      <>
                        <button
                          disabled={busy}
                          onClick={() => perSellerAction(seller.id, "disable")}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-50"
                        >
                          Disable
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => perSellerAction(seller.id, "suspend")}
                          className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      </>
                    )}
                    {seller.slug && (
                      <>
                        <a
                          href={`/${urlPrefix}/${seller.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-ink hover:bg-gray-50"
                        >
                          View page
                        </a>
                        <button
                          onClick={() => copyLink(seller.slug as string)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-ink hover:bg-gray-50"
                        >
                          Copy link
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
