import { NextResponse } from "next/server";
import { clearSessionCookie, readSession } from "@/lib/session";
import { readTrustedDeviceCookie } from "@/lib/deviceFingerprint";
import { getAuthPolicy, revokeCurrentDevice } from "@/lib/authPolicy";

export async function POST() {
  const session = await readSession();
  if (session) {
    const policy = await getAuthPolicy();
    if (policy.forceOtpAfterLogout) {
      const deviceToken = await readTrustedDeviceCookie();
      await revokeCurrentDevice(session.userId, deviceToken);
    }
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
