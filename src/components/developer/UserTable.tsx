"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserRow = {
  id: string;
  name: string | null;
  phone: string;
  role: string;
  active: boolean;
  createdAt: string;
};

export default function UserTable({
  users,
  roleLabels,
  currentUserId,
}: {
  users: UserRow[];
  roleLabels: Record<string, string>;
  currentUserId: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(id: string, role: string) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/developer/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error ?? "Could not update role.");
      return;
    }
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/developer/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error ?? "Could not update this account.");
      return;
    }
    router.refresh();
  }

  async function deleteUser(id: string) {
    if (!confirm("Permanently delete this account? This only succeeds for accounts with no listings, chats, or reviews.")) return;
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/developer/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error ?? "Could not delete this account.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-950">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id}>
                  <td className="px-3 py-2 text-white">{u.name ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-300">{u.phone}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      disabled={busyId === u.id || isSelf}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="rounded-lg border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-white disabled:opacity-50"
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {u.active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        disabled={busyId === u.id || isSelf}
                        onClick={() => toggleActive(u.id, u.active)}
                        className="rounded-md border border-gray-700 px-2 py-1 text-xs font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
                      >
                        {u.active ? "Suspend" : "Activate"}
                      </button>
                      <Link
                        href={`/developer/logins?phone=${encodeURIComponent(u.phone)}`}
                        className="rounded-md border border-gray-700 px-2 py-1 text-xs font-medium text-gray-200 hover:bg-gray-800"
                      >
                        Login history
                      </Link>
                      <button
                        disabled={busyId === u.id || isSelf}
                        onClick={() => deleteUser(u.id)}
                        className="rounded-md border border-red-900 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No users match this filter.</p>}
      </div>
    </div>
  );
}
