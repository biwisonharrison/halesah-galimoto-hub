import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";
import AdminDeletionRequestActions from "@/components/AdminDeletionRequestActions";

export default async function AdminDeletionRequestsPage() {
  const requests = await prisma.listingDeletionRequest.findMany({
    where: { status: "PENDING" },
    include: { listing: true, seller: true },
    orderBy: { requestedAt: "asc" },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Pending deletion requests ({requests.length})</h2>
      {requests.length === 0 ? (
        <p className="mt-4 text-gray-500">No pending deletion requests.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/marketplace/${req.listingId}`} className="font-semibold text-ink hover:underline">
                    {req.listing.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-600">
                    Requested by {req.seller.name ?? req.seller.phone} · {timeAgo(req.requestedAt)}
                  </p>
                  {req.reason && <p className="mt-1 text-sm text-gray-500">&quot;{req.reason}&quot;</p>}
                </div>
                <AdminDeletionRequestActions requestId={req.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
