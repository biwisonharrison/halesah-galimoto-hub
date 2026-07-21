/**
 * Best-effort user-agent classification via substring matching — not a full
 * UA-parsing library, but accurate enough for the Developer Panel's device
 * and browser breakdown charts.
 */
export function classifyBrowser(userAgent: string | null): string {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  return "Other";
}

export function classifyDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("ipad") || ua.includes("tablet")) return "Tablet";
  if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone")) return "Mobile";
  return "Desktop";
}

export function referrerSource(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
    if (host.includes("whatsapp")) return "WhatsApp";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("twitter") || host.includes("x.com")) return "Twitter/X";
    return host;
  } catch {
    return "Direct";
  }
}
