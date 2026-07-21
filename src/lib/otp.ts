import "server-only";
import { prisma } from "@/lib/prisma";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;

function generateCode(): string {
  const max = 10 ** OTP_LENGTH;
  return Math.floor(Math.random() * max)
    .toString()
    .padStart(OTP_LENGTH, "0");
}

/**
 * Sends the OTP code to a phone number. Defaults to logging to the server
 * console so the whole auth flow works with zero external accounts during
 * development. Set OTP_PROVIDER=africastalking (plus the AFRICASTALKING_*
 * env vars below) to send real SMS instead.
 */
async function deliverOtp(phone: string, code: string): Promise<void> {
  const provider = process.env.OTP_PROVIDER ?? "console";

  if (provider === "console") {
    console.log(`[OTP] ${phone} -> ${code} (valid ${OTP_TTL_MINUTES} min)`);
    return;
  }

  if (provider === "africastalking") {
    await sendViaAfricasTalking(phone, code);
    return;
  }

  throw new Error(`Unknown OTP_PROVIDER "${provider}"`);
}

async function sendViaAfricasTalking(phone: string, code: string): Promise<void> {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;
  if (!apiKey || !username) {
    throw new Error("AFRICASTALKING_API_KEY and AFRICASTALKING_USERNAME must be set to use the africastalking OTP provider.");
  }

  const baseUrl =
    username === "sandbox"
      ? "https://api.sandbox.africastalking.com/version1/messaging"
      : "https://api.africastalking.com/version1/messaging";

  const params = new URLSearchParams({
    username,
    to: phone,
    message: `Your Halesah Galimoto Hub verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
  });
  if (process.env.AFRICASTALKING_SENDER_ID) {
    params.set("from", process.env.AFRICASTALKING_SENDER_ID);
  }

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      apiKey,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Africa's Talking SMS failed (${res.status}): ${text}`);
  }
}

export async function requestOtp(phone: string): Promise<void> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({ data: { phone, code, expiresAt } });
  await deliverOtp(phone, code);
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const candidate = await prisma.otpCode.findFirst({
    where: { phone, code, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!candidate) return false;

  await prisma.otpCode.update({ where: { id: candidate.id }, data: { consumed: true } });
  return true;
}
