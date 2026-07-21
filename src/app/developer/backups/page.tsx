import { prisma } from "@/lib/prisma";
import BackupControls from "@/components/developer/BackupControls";

export default async function BackupsPage() {
  const backups = await prisma.backup.findMany({
    include: { createdBy: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Backups &amp; restore</h1>
      <p className="mt-1 text-sm text-gray-400">
        Manual, on-demand backups of the database, uploaded photos, and site configuration.
      </p>

      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
        <p className="font-semibold">About automatic scheduling</p>
        <p className="mt-1">
          This app has no background job runner, so backups can&apos;t schedule themselves from inside the panel.
          To automate them, point an OS-level scheduler (e.g. Windows Task Scheduler) at this endpoint on a timer:
        </p>
        <code className="mt-2 block rounded bg-black/30 px-2 py-1">
          POST {"{"}your-site-url{"}"}/api/developer/backups with body {"{"}"type":"DATABASE"{"}"} (developer session
          cookie required)
        </code>
      </div>

      <div className="mt-6">
        <BackupControls
          backups={backups.map((b) => ({
            id: b.id,
            type: b.type,
            status: b.status,
            filename: b.filename,
            sizeBytes: b.sizeBytes,
            errorMessage: b.errorMessage,
            createdAt: b.createdAt.toISOString(),
            createdByLabel: b.createdBy?.name ?? b.createdBy?.phone ?? null,
          }))}
        />
      </div>
    </div>
  );
}
