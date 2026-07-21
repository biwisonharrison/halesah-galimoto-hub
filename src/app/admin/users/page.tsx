import { prisma } from "@/lib/prisma";
import AdminUserActions from "@/components/AdminUserActions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { sellerAccount: true, _count: { select: { listings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Users ({users.length})</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Listings</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-ink">{user.name ?? "Not provided"}</td>
                <td className="px-4 py-3 text-gray-600">{user.phone}</td>
                <td className="px-4 py-3">
                  {user.role}
                  {user.sellerAccount?.verified && (
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-800">Verified seller</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{user._count.listings}</td>
                <td className="px-4 py-3">
                  <AdminUserActions
                    userId={user.id}
                    isSeller={Boolean(user.sellerAccount)}
                    sellerVerified={Boolean(user.sellerAccount?.verified)}
                    isAdmin={user.role === "ADMIN"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
