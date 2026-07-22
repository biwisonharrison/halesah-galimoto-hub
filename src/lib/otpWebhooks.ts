import "server-only";
import { prisma } from "@/lib/prisma";

export type OtpWebhookKind = "DELIVERY" | "VERIFICATION" | "FAILURE";

export async function fireOtpWebhook(kind: OtpWebhookKind, url: string | null | undefined, payload: Record<string, unknown>) {
  if (!url) return;

  let statusCode: number | undefined;
  let success = false;
  let responseBody: string | undefined;
  let errorMessage: string | undefined;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...payload, timestamp: new Date().toISOString() }),
    });
    statusCode = res.status;
    success = res.ok;
    responseBody = (await res.text().catch(() => "")).slice(0, 500);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Webhook request failed";
  }

  await prisma.otpWebhookLog
    .create({
      data: {
        kind,
        url,
        statusCode,
        success,
        payload: JSON.stringify(payload).slice(0, 1000),
        responseBody,
        errorMessage,
      },
    })
    .catch(() => null);
}
