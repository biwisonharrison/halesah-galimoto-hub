"use client";

import { useEffect, useState } from "react";
import type { ProviderConfig } from "./types";

interface DeliveryLog {
  id: string;
  createdAt: string;
  purpose: string;
  channel: string;
  destination: string;
  providerKey: string;
  status: string;
  errorMessage: string | null;
  responseTimeMs: number | null;
  ipAddress: string | null;
}

export default function OtpLogsTab({ providers }: { providers: ProviderConfig[] }) {
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [status, setStatus] = useState("");
  const [providerKey, setProviderKey] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type: "delivery", page: String(page) });
    if (status) params.set("status", status);
    if (providerKey) params.set("providerKey", providerKey);
    fetch(`/api/developer/otp/logs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs ?? []);
        setTotalPages(d.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [status, providerKey, page]);

  const uniqueProviderKeys = Array.from(new Set(providers.map((p) => p.providerKey)));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          value={providerKey}
          onChange={(e) => {
            setProviderKey(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
        >
          <option value="">All providers</option>
          {uniqueProviderKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <a href="/api/developer/otp/logs/export" className="ml-auto rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800">
          Export CSV
        </a>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Purpose</th>
              <th className="px-3 py-2 font-medium">Channel</th>
              <th className="px-3 py-2 font-medium">Destination</th>
              <th className="px-3 py-2 font-medium">Provider</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Time (ms)</th>
              <th className="px-3 py-2 font-medium">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-950">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                  No delivery logs yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-2 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-gray-200">{log.purpose}</td>
                  <td className="px-3 py-2 text-gray-200">{log.channel}</td>
                  <td className="px-3 py-2 text-gray-200">{log.destination}</td>
                  <td className="px-3 py-2 text-gray-200">{log.providerKey}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${log.status === "SENT" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-400">{log.responseTimeMs ?? "—"}</td>
                  <td className="max-w-xs truncate px-3 py-2 text-red-400">{log.errorMessage ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-md px-3 py-1.5 ${p === page ? "bg-emerald-600 text-white" : "border border-gray-700 text-gray-300"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
