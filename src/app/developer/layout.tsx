import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Developer panel",
  robots: { index: false, follow: false, nocache: true },
};

const DEVELOPER_NAV = [
  { href: "/developer", label: "Overview" },
  { href: "/developer/customization", label: "Site customization" },
  { href: "/developer/homepage", label: "Homepage sections" },
  { href: "/developer/vehicles", label: "Vehicles" },
  { href: "/developer/analytics", label: "Analytics" },
  { href: "/developer/users", label: "Users" },
  { href: "/developer/logins", label: "Login activity" },
  { href: "/developer/backups", label: "Backups" },
  { href: "/developer/settings", label: "System settings" },
  { href: "/developer/otp", label: "OTP Configuration" },
];

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/developer");
  if (user.role !== "DEVELOPER") redirect("/");

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-800 bg-gray-900 md:flex">
        <div className="border-b border-gray-800 px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Developer panel</p>
          <p className="mt-1 text-xs text-gray-500">Signed in as {user.name ?? user.phone}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {DEVELOPER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-gray-800 px-5 py-4 text-sm">
          <Link href="/" className="text-gray-400 hover:text-white">
            ← Back to site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        <div className="border-b border-gray-800 bg-gray-900 px-4 py-3 md:hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Developer panel</p>
          <nav className="mt-2 flex flex-wrap gap-2">
            {DEVELOPER_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-200">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
