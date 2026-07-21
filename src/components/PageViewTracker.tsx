"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const payload = JSON.stringify({ path: pathname, referrer: document.referrer || undefined });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track/pageview", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track/pageview", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
