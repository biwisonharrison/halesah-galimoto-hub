import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";
import AdminReportActions from "@/components/AdminReportActions";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: { listing: true, reporter: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Pending reports ({reports.length})</h2>
      {reports.length === 0 ? (
        <p className="mt-4 text-gray-500">No pending reports. Nice and clean.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/marketplace/${report.listingId}`} className="font-semibold text-ink hover:underline">
                    {report.listing.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-600">&quot;{report.reason}&quot;</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Reported by {report.reporter.name ?? report.reporter.phone} · {timeAgo(report.createdAt)}
                  </p>
                </div>
                <AdminReportActions reportId={report.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
