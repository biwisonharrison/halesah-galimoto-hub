import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/deletion-requests", label: "Deletion requests" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/payment-settings", label: "Payment settings" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/catalogue", label: "Catalogue" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "ADMIN" && user.role !== "DEVELOPER") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink">Admin panel</h1>
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {ADMIN_NAV.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
