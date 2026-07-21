import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const bodySchema = z.object({
  type: z.enum(["STANDARD_BANK", "NATIONAL_BANK", "MPAMBA", "AIRTEL_MONEY"]),
  label: z.string().trim().min(1).max(100),
  accountName: z.string().trim().max(100).optional(),
  accountNumber: z.string().trim().max(60).optional(),
  phoneNumber: z.string().trim().max(30).optional(),
  instructions: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the payment method details." }, { status: 400 });
  }

  const method = await prisma.paymentMethod.create({ data: parsed.data });
  return NextResponse.json({ method });
}
