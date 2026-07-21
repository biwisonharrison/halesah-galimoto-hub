import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageViewTracker from "@/components/PageViewTracker";
import MaintenancePage from "@/components/MaintenancePage";
import { getSiteSettings } from "@/lib/siteSettings";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.tagline ? `${settings.siteName}, ${settings.tagline}` : settings.siteName,
    description:
      "Look up any car's history and fair Malawian price, buy or sell used cars, and explore a full brand catalogue built for Malawi.",
    icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined,
  };
}

const MAINTENANCE_BYPASS_PREFIXES = ["/developer", "/login", "/api", "/access-denied"];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);

  const pathname = (await headers()).get("x-pathname") ?? "";
  const bypassesMaintenance = MAINTENANCE_BYPASS_PREFIXES.some((p) => pathname.startsWith(p));
  const canBypassMaintenance = user?.role === "DEVELOPER" || user?.role === "ADMIN";
  const showMaintenance = settings.maintenanceMode && !bypassesMaintenance && !canBypassMaintenance;

  return (
    <html lang="en">
      <head>
        <style>{`:root {
          --color-primary: ${settings.primaryColor};
          --color-secondary: ${settings.secondaryColor};
          --font-family: ${settings.fontFamily}, ui-sans-serif;
        }`}</style>
        {settings.fontFamily && settings.fontFamily !== "Inter" && (
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(settings.fontFamily)}:wght@400;500;600;700;800&display=swap`}
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <PageViewTracker />
        {showMaintenance ? (
          <MaintenancePage message={settings.maintenanceMessage} />
        ) : (
          <>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </>
        )}
      </body>
    </html>
  );
}
