import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";
import CreateUserForm from "@/components/developer/CreateUserForm";
import UserTable from "@/components/developer/UserTable";
import { getCurrentUser } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = {
  DEVELOPER: "Developer",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  DEALER: "Dealer",
  SALES_AGENT: "Sales Agent",
  MODERATOR: "Moderator",
  BUYER: "Customer",
};

export default async function DeveloperUsersPage({ searchParams }: { searchParams: { role?: string; q?: string } }) {
  const [users, me] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: searchParams.role ? (searchParams.role as UserRole) : undefined,
        ...(searchParams.q
          ? { OR: [{ name: { contains: searchParams.q, mode: "insensitive" } }, { phone: { contains: searchParams.q } }] }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    getCurrentUser(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <p className="mt-1 text-sm text-gray-400">
        Manage every account and its role. Authentication is phone + OTP — there are no passwords to reset.
      </p>

      <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-4 text-xs text-gray-400">
        <span className="font-semibold text-gray-300">Roles:</span> Developer (full panel access) · Administrator (admin
        panel) · Manager (oversight, no code-level settings) · Dealer / Sales Agent (sell vehicles) · Moderator (reports
        &amp; listings review) · Customer (buyer accounts) · Guest — not a stored account; anonymous visitors who haven't
        signed in.
      </div>

      <div className="mt-6">
        <CreateUserForm />
      </div>

      <form className="mt-8 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search name or phone…"
          className="w-64 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        />
        <select name="role" defaultValue={searchParams.role ?? ""} className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white">
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800">
          Filter
        </button>
      </form>

      <div className="mt-4">
        <UserTable
          currentUserId={me?.id ?? ""}
          users={users.map((u) => ({
            id: u.id,
            name: u.name,
            phone: u.phone,
            role: u.role,
            active: u.active,
            createdAt: u.createdAt.toISOString(),
          }))}
          roleLabels={ROLE_LABELS}
        />
      </div>
    </div>
  );
}
