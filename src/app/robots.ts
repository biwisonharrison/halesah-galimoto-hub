import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.halesahgalimotohub.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/developer", "/manager", "/admin", "/api"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
