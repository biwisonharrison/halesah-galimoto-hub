import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { TRIAL_DURATION_DAYS } from "@/lib/seller";

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "reactivate", "edit"]),
  rejectionReason: z.string().trim().max(500).optional(),
  businessName: z.string().trim().min(2).max(120).optional(),
  registrationNumber: z.string().trim().max(60).optional(),
  district: z.string().trim().max(60).optional(),
  description: z.string().trim().max(1000).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const account = await prisma.sellerAccount.findUnique({ where: { id: params.id } });
  if (!account) return NextResponse.json({ error: "Seller account not found." }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const data = parsed.data;

  if (data.action === "approve") {
    const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
    await prisma.sellerAccount.update({
      where: { id: account.id },
      data: { status: "APPROVED", subscriptionStatus: "TRIAL", trialEndsAt, rejectionReason: null },
    });
    await notify(account.userId, "REGISTRATION_APPROVED", "Seller application approved", "Your seller account was approved. You have a free 30-day trial to start listing cars.");
  } else if (data.action === "reject") {
    await prisma.sellerAccount.update({
      where: { id: account.id },
      data: { status: "REJECTED", rejectionReason: data.rejectionReason },
    });
    await notify(account.userId, "REGISTRATION_REJECTED", "Seller application rejected", data.rejectionReason ?? "Your seller application was not approved.");
  } else if (data.action === "suspend") {
    await prisma.sellerAccount.update({ where: { id: account.id }, data: { status: "SUSPENDED", suspendedAt: new Date() } });
  } else if (data.action === "reactivate") {
    await prisma.sellerAccount.update({ where: { id: account.id }, data: { status: "APPROVED", suspendedAt: null } });
  } else if (data.action === "edit") {
    await prisma.sellerAccount.update({
      where: { id: account.id },
      data: {
        businessName: data.businessName ?? account.businessName,
        registrationNumber: data.registrationNumber,
        district: data.district,
        description: data.description,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const account = await prisma.sellerAccount.findUnique({ where: { id: params.id } });
  if (!account) return NextResponse.json({ error: "Seller account not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.sellerAccount.delete({ where: { id: account.id } }),
    prisma.user.update({ where: { id: account.userId }, data: { role: "BUYER" } }),
  ]);

  return NextResponse.json({ ok: true });
}
