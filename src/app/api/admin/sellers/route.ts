import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeMalawiPhone } from "@/lib/phone";
import { TRIAL_DURATION_DAYS } from "@/lib/seller";

const createSchema = z.object({
  phone: z.string().min(1),
  name: z.string().trim().min(1).max(100).optional(),
  businessName: z.string().trim().min(2).max(120),
  registrationNumber: z.string().trim().max(60).optional(),
  district: z.string().trim().max(60).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const sellers = await prisma.sellerAccount.findMany({
    include: { user: true, _count: { select: { payments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sellers });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the seller details." }, { status: 400 });
  }

  const phone = normalizeMalawiPhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "Enter a valid Malawian phone number." }, { status: 400 });

  const existingUser = await prisma.user.findUnique({ where: { phone }, include: { sellerAccount: true } });
  if (existingUser?.sellerAccount) {
    return NextResponse.json({ error: "This phone number already has a seller account." }, { status: 409 });
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const user = await prisma.user.upsert({
    where: { phone },
    update: { role: "DEALER" },
    create: { phone, name: parsed.data.name, role: "DEALER", phoneVerifiedAt: new Date() },
  });

  await prisma.sellerAccount.create({
    data: {
      userId: user.id,
      businessName: parsed.data.businessName,
      registrationNumber: parsed.data.registrationNumber,
      district: parsed.data.district,
      status: "APPROVED",
      subscriptionStatus: "TRIAL",
      trialEndsAt,
    },
  });

  return NextResponse.json({ ok: true });
}
