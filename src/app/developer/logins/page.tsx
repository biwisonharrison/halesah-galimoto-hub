import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";

export default async function LoginActivityPage({ searchParams }: { searchParams: { phone?: string } }) {
  const attempts = await prisma.loginAttempt.findMany({
    where: searchParams.phone ? { phone: searchParams.phone } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Login activity</h1>
      <p className="mt-1 text-sm text-gray-400">
        {searchParams.phone ? (
          <>
            Showing attempts for {searchParams.phone}.{" "}
            <Link href="/developer/logins" className="text-emerald-400 hover:underline">
              Clear filter
            </Link>
          </>
        ) : (
          "Every OTP verification attempt, successful or not. Most recent 200 shown."
        )}
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Result</th>
              <th className="px-4 py-2 font-medium">Reason</th>
              <th className="px-4 py-2 font-medium">IP address</th>
              <th className="px-4 py-2 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-950">
            {attempts.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2 text-gray-200">{a.phone}</td>
                <td className={`px-4 py-2 font-medium ${a.success ? "text-emerald-400" : "text-red-400"}`}>
                  {a.success ? "Success" : "Failed"}
                </td>
                <td className="px-4 py-2 text-gray-500">{a.reason ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">{a.ipAddress ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">{timeAgo(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {attempts.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No login attempts logged yet.</p>}
      </div>
    </div>
  );
}
