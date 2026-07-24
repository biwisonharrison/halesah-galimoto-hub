import "server-only";

/**
 * Best-effort in-memory sliding-window rate limiter for public seller-share
 * traffic. Module-level state, not shared across serverless instances/cold
 * starts — acceptable for an opt-in security nicety in an app with no
 * Redis/shared-cache infra, matching how other analytics here are
 * best-effort (never block the core page load).
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;

export function checkRateLimit(key: string, limitPerMinute: number): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= limitPerMinute) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}
