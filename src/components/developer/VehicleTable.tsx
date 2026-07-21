"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Vehicle = {
  id: string;
  title: string;
  priceMwk: number;
  status: string;
  featured: boolean;
  createdAt: string;
  sellerName: string;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-800 text-gray-300",
  PENDING_APPROVAL: "bg-amber-500/20 text-amber-400",
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  RESERVED: "bg-sky-500/20 text-sky-400",
  SOLD: "bg-gray-800 text-gray-400",
  HIDDEN: "bg-gray-800 text-gray-400",
  ARCHIVED: "bg-gray-800 text-gray-500",
  PENDING_DELETION: "bg-red-500/20 text-red-400",
  REJECTED: "bg-red-500/20 text-red-400",
  EXPIRED: "bg-amber-500/20 text-amber-400",
  DELETED: "bg-red-500/20 text-red-400",
};

const ROW_ACTIONS: { action: string; label: string }[] = [
  { action: "publish", label: "Publish" },
  { action: "unpublish", label: "Unpublish" },
  { action: "reserve", label: "Reserve" },
  { action: "mark-sold", label: "Mark sold" },
  { action: "archive", label: "Archive" },
  { action: "restore", label: "Restore" },
  { action: "delete", label: "Delete" },
];

const BULK_ACTIONS: { action: string; label: string }[] = [
  { action: "publish", label: "Publish" },
  { action: "unpublish", label: "Unpublish" },
  { action: "feature", label: "Feature" },
  { action: "unfeature", label: "Unfeature" },
  { action: "archive", label: "Archive" },
  { action: "restore", label: "Restore" },
  { action: "delete", label: "Delete" },
];

function formatMWK(amount: number) {
  return new Intl.NumberFormat("en-MW", { maximumFractionDigits: 0 }).format(amount) + " MWK";
}

export default function VehicleTable({ listings }: { listings: Vehicle[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === listings.length ? new Set() : new Set(listings.map((l) => l.id))));
  }

  async function rowAction(id: string, action: string) {
    if (action === "delete" && !confirm("Delete this listing? It will be hidden from the marketplace.")) return;
    setBusyId(id);
    await fetch(`/api/developer/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function toggleFeatured(id: string, featured: boolean) {
    setBusyId(id);
    await fetch(`/api/developer/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: featured ? "unfeature" : "feature" }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function duplicate(id: string) {
    setBusyId(id);
    await fetch(`/api/developer/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function bulkAction(action: string) {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} listing(s)?`)) return;
    setBulkBusy(true);
    await fetch("/api/developer/listings/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), action }),
    });
    setBulkBusy(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <span className="text-sm font-medium text-emerald-300">{selected.size} selected</span>
          {BULK_ACTIONS.map((a) => (
            <button
              key={a.action}
              disabled={bulkBusy}
              onClick={() => bulkAction(a.action)}
              className="rounded-md border border-gray-700 bg-gray-900 px-2.5 py-1 text-xs font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="w-10 px-3 py-2">
                <input type="checkbox" checked={selected.size === listings.length && listings.length > 0} onChange={toggleAll} />
              </th>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Seller</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Featured</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-950">
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selected.has(listing.id)} onChange={() => toggle(listing.id)} />
                </td>
                <td className="px-3 py-2">
                  <Link href={`/marketplace/${listing.id}`} className="font-medium text-white hover:underline">
                    {listing.title}
                  </Link>
                </td>
                <td className="px-3 py-2 text-gray-300">{formatMWK(listing.priceMwk)}</td>
                <td className="px-3 py-2 text-gray-400">{listing.sellerName}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[listing.status] ?? "bg-gray-800 text-gray-300"}`}>
                    {listing.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button
                    disabled={busyId === listing.id}
                    onClick={() => toggleFeatured(listing.id, listing.featured)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      listing.featured ? "bg-amber-500/20 text-amber-400" : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {listing.featured ? "Featured" : "Not featured"}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <Link
                      href={`/dashboard/listings/${listing.id}/edit`}
                      className="rounded-md border border-gray-700 px-2 py-1 text-xs font-medium text-gray-200 hover:bg-gray-800"
                    >
                      Edit
                    </Link>
                    <button
                      disabled={busyId === listing.id}
                      onClick={() => duplicate(listing.id)}
                      className="rounded-md border border-gray-700 px-2 py-1 text-xs font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
                    >
                      Duplicate
                    </button>
                    {ROW_ACTIONS.map((a) => (
                      <button
                        key={a.action}
                        disabled={busyId === listing.id}
                        onClick={() => rowAction(listing.id, a.action)}
                        className="rounded-md border border-gray-700 px-2 py-1 text-xs font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {listings.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No vehicles match this filter.</p>}
      </div>
    </div>
  );
}
