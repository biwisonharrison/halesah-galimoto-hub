"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BackupRow = {
  id: string;
  type: "DATABASE" | "MEDIA" | "CONFIG";
  status: "PENDING" | "COMPLETED" | "FAILED";
  filename: string;
  sizeBytes: number | null;
  errorMessage: string | null;
  createdAt: string;
  createdByLabel: string | null;
};

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_LABELS: Record<string, string> = { DATABASE: "Database", MEDIA: "Media", CONFIG: "Config" };
const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-500/20 text-emerald-400",
  FAILED: "bg-red-500/20 text-red-400",
  PENDING: "bg-amber-500/20 text-amber-400",
};

export default function BackupControls({ backups }: { backups: BackupRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<BackupRow | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function createBackup(type: "DATABASE" | "MEDIA" | "CONFIG") {
    setCreating(type);
    setError(null);
    const res = await fetch("/api/developer/backups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(null);
    if (!res.ok) {
      setError(data.error ?? "Could not start the backup.");
      return;
    }
    router.refresh();
  }

  async function deleteBackup(id: string) {
    if (!confirm("Delete this backup file permanently?")) return;
    setBusyId(id);
    await fetch(`/api/developer/backups/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  async function confirmRestore() {
    if (!restoreTarget) return;
    setBusyId(restoreTarget.id);
    setError(null);
    const res = await fetch(`/api/developer/backups/${restoreTarget.id}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: confirmText }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error ?? "Restore failed.");
      return;
    }
    setRestoreTarget(null);
    setConfirmText("");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          disabled={creating !== null}
          onClick={() => createBackup("DATABASE")}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {creating === "DATABASE" ? "Backing up…" : "Backup database now"}
        </button>
        <button
          disabled={creating !== null}
          onClick={() => createBackup("MEDIA")}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
        >
          {creating === "MEDIA" ? "Archiving…" : "Backup uploaded media now"}
        </button>
        <button
          disabled={creating !== null}
          onClick={() => createBackup("CONFIG")}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
        >
          {creating === "CONFIG" ? "Exporting…" : "Backup site config now"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">File</th>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-950">
            {backups.map((b) => (
              <tr key={b.id}>
                <td className="px-3 py-2 text-gray-200">{TYPE_LABELS[b.type]}</td>
                <td className="px-3 py-2 text-gray-400">{b.filename}</td>
                <td className="px-3 py-2 text-gray-400">{formatBytes(b.sizeBytes)}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                  {b.errorMessage && <p className="mt-1 max-w-xs text-[11px] text-red-400">{b.errorMessage}</p>}
                </td>
                <td className="px-3 py-2 text-gray-500">{new Date(b.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {b.status === "COMPLETED" && (
                      <a
                        href={`/api/developer/backups/${b.id}/download`}
                        className="rounded-md border border-gray-700 px-2 py-1 text-xs font-medium text-gray-200 hover:bg-gray-800"
                      >
                        Download
                      </a>
                    )}
                    {b.status === "COMPLETED" && b.type !== "MEDIA" && (
                      <button
                        disabled={busyId === b.id}
                        onClick={() => setRestoreTarget(b)}
                        className="rounded-md border border-amber-700 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-950 disabled:opacity-50"
                      >
                        Restore
                      </button>
                    )}
                    <button
                      disabled={busyId === b.id}
                      onClick={() => deleteBackup(b.id)}
                      className="rounded-md border border-red-900 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {backups.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No backups yet.</p>}
      </div>

      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-lg font-bold text-white">Restore {TYPE_LABELS[restoreTarget.type]} backup?</h2>
            <p className="mt-2 text-sm text-gray-400">
              This overwrites the live {restoreTarget.type === "DATABASE" ? "database" : "site configuration"} with the
              contents of <span className="text-gray-200">{restoreTarget.filename}</span>. This can&apos;t be undone
              except by restoring another backup. Type <span className="font-mono text-amber-400">RESTORE</span> to
              confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-3 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
              placeholder="RESTORE"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRestoreTarget(null);
                  setConfirmText("");
                }}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                disabled={confirmText !== "RESTORE" || busyId === restoreTarget.id}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {busyId === restoreTarget.id ? "Restoring…" : "Restore now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
