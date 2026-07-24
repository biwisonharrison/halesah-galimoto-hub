import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Manager panel",
  robots: { index: false, follow: false, nocache: true },
};

const MANAGER_NAV = [{ href: "/manager/seller-sharing", label: "Seller inventory sharing" }];

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/manager");
  if (user.role !== "MANAGER" && user.role !== "ADMIN" && user.role !== "DEVELOPER") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink">Manager panel</h1>
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {MANAGER_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
