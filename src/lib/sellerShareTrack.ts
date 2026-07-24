export type SellerShareEvent = "listing_click" | "phone_click" | "whatsapp_click" | "share_click";

/** Fire-and-forget click tracking for a seller's public share page, mirroring PageViewTracker's beacon pattern. */
export function trackSellerShareEvent(slug: string, event: SellerShareEvent): void {
  const payload = JSON.stringify({ event });
  const url = `/api/seller-share/${slug}/track`;

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
  } else {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
  }
}
