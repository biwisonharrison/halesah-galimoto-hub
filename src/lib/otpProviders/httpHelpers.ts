import type { OtpSendResult } from "./types";

async function toShortText(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  return text.slice(0, 500);
}

export async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<OtpSendResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    const text = await toShortText(res);
    if (!res.ok) return { success: false, error: `HTTP ${res.status}: ${text}` };
    return { success: true, providerResponse: text };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function postForm(
  url: string,
  body: Record<string, string>,
  headers: Record<string, string> = {}
): Promise<OtpSendResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
      body: new URLSearchParams(body).toString(),
    });
    const text = await toShortText(res);
    if (!res.ok) return { success: false, error: `HTTP ${res.status}: ${text}` };
    return { success: true, providerResponse: text };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export function basicAuthHeader(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}
