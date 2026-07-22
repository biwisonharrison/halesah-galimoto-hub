import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { normalizeMalawiPhone } from "@/lib/phone";

const phoneField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const bodySchema = z.object({
  whatsappNumber: phoneField,
  callPhoneNumber: phoneField,
});

export async function PATCH(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  if (!user.sellerAccount) {
    return NextResponse.json({ error: "You don't have a seller account yet." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the phone numbers you entered." }, { status: 400 });
  }

  let whatsappNumber: string | null = null;
  if (parsed.data.whatsappNumber) {
    whatsappNumber = normalizeMalawiPhone(parsed.data.whatsappNumber);
    if (!whatsappNumber) {
      return NextResponse.json({ error: "WhatsApp number doesn't look like a valid Malawian number." }, { status: 400 });
    }
  }

  let callPhoneNumber: string | null = null;
  if (parsed.data.callPhoneNumber) {
    callPhoneNumber = normalizeMalawiPhone(parsed.data.callPhoneNumber);
    if (!callPhoneNumber) {
      return NextResponse.json({ error: "Call number doesn't look like a valid Malawian number." }, { status: 400 });
    }
  }

  const updated = await prisma.sellerAccount.update({
    where: { userId: user.id },
    data: { whatsappNumber, callPhoneNumber },
  });

  return NextResponse.json({
    whatsappNumber: updated.whatsappNumber,
    callPhoneNumber: updated.callPhoneNumber,
  });
}
