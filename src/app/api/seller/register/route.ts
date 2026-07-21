import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notifyAllAdmins } from "@/lib/notifications";

const bodySchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  registrationNumber: z.string().trim().max(60).optional(),
  district: z.string().trim().max(60).optional(),
  description: z.string().trim().max(1000).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const existing = await prisma.sellerAccount.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({ error: "You've already applied to become a seller." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your application details." }, { status: 400 });
  }

  await prisma.sellerAccount.create({
    data: {
      userId: user.id,
      businessName: parsed.data.businessName,
      registrationNumber: parsed.data.registrationNumber,
      district: parsed.data.district,
      description: parsed.data.description,
    },
  });

  // Only promote a plain customer to Dealer — never downgrade a staff role
  // (Admin/Developer/Manager/etc.) just because they also applied to sell a car.
  if (user.role === "BUYER") {
    await prisma.user.update({ where: { id: user.id }, data: { role: "DEALER" } });
  }

  await notifyAllAdmins(
    "ADMIN_NEW_SELLER",
    "New seller application",
    `${parsed.data.businessName} (${user.phone}) applied to become a seller.`
  );

  return NextResponse.json({ ok: true });
}
