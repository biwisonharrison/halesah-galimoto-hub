import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/siteSettings";
import { getLang, t } from "@/lib/i18n";
import LogoutButton from "./LogoutButton";
import { SearchIcon, UserIcon } from "./icons";

const NAV_KEYS = [
  { href: "/marketplace", key: "nav_buy" as const },
  { href: "/sell", key: "nav_sell" as const },
  { href: "/brands", key: "nav_brands" as const },
  { href: "/lookup", key: "nav_lookup" as const },
];

export default async function SiteHeader() {
  const [user, settings, lang] = await Promise.all([getCurrentUser(), getSiteSettings(), getLang()]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5">
        <Link href="/" className="flex shrink-0 flex-col items-center gap-0.5 pr-1">
          {settings.logoUrl ? (
            <span className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-cover" />
            </span>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
              {initials(settings.siteName)}
            </span>
          )}
          <span className="hidden text-[10px] font-bold leading-none text-ink sm:inline">{settings.siteName}</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-5 md:flex">
          {NAV_KEYS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold uppercase text-gray-600 hover:text-ink ${lang === "both" ? "" : "whitespace-nowrap"}`}
            >
              {t(lang, link.key)}
            </Link>
          ))}
        </nav>

        <form action="/marketplace" className="hidden flex-1 items-center sm:flex md:max-w-[180px]">
          <div className="flex w-full items-center gap-1.5 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 focus-within:border-brand-400 focus-within:bg-white">
            <SearchIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              name="q"
              type="text"
              placeholder={t(lang, "search_placeholder")}
              className="w-full bg-transparent text-sm text-ink placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-ink"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name ?? user.phone}</span>
              </Link>
              {(user.role === "ADMIN" || user.role === "DEVELOPER") && (
                <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-ink">
                  {t(lang, "nav_admin")}
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
            >
              <UserIcon className="h-4 w-4" />
              {t(lang, "nav_login")}
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto border-t border-gray-100 px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {NAV_KEYS.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 text-sm font-bold uppercase text-gray-700">
            {t(lang, link.key)}
          </Link>
        ))}
      </div>
    </header>
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("") || "GH";
}
