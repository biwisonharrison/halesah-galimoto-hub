import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMalawiPhone } from "@/lib/phone";
import { requestOtp } from "@/lib/otp";

const bodySchema = z.object({ phone: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a phone number." }, { status: 400 });
  }

  const phone = normalizeMalawiPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid Malawian phone number." }, { status: 400 });
  }

  await requestOtp(phone);

  return NextResponse.json({ ok: true, phone });
}
