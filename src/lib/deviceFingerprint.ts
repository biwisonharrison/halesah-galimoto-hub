import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";

const TRUSTED_DEVICE_COOKIE = "galimoto_td";

export function parseUserAgent(userAgent: string | null | undefined): { browser: string; os: string; label: string } {
  const ua = userAgent ?? "";

  let browser = "Unknown browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/CriOS\//.test(ua)) browser = "Chrome (iOS)";
  else if (/FxiOS\//.test(ua)) browser = "Firefox (iOS)";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua) && !/Mobile/.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Linux/.test(ua)) os = "Linux";

  return { browser, os, label: `${browser} on ${os}` };
}

export function generateDeviceToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("base64url");
  return { rawToken, tokenHash: hashDeviceToken(rawToken) };
}

export function hashDeviceToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function setTrustedDeviceCookie(rawToken: string, validityDays: number) {
  const store = await cookies();
  store.set(TRUSTED_DEVICE_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: validityDays * 24 * 60 * 60,
  });
}

export async function readTrustedDeviceCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(TRUSTED_DEVICE_COOKIE)?.value ?? null;
}

export async function clearTrustedDeviceCookie() {
  const store = await cookies();
  store.delete(TRUSTED_DEVICE_COOKIE);
}
