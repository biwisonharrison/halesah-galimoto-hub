import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({ action: z.enum(["confirm", "reject"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const payment = await prisma.subscriptionPayment.findUnique({ where: { id: params.id }, include: { plan: true, sellerAccount: true } });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status !== "PENDING") return NextResponse.json({ error: "This payment was already resolved." }, { status: 409 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  if (parsed.data.action === "confirm") {
    const durationDays = payment.plan?.durationDays ?? 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: { status: "CONFIRMED", confirmedAt: new Date(), confirmedById: admin.id },
      }),
      prisma.sellerAccount.update({
        where: { id: payment.sellerAccountId },
        data: { subscriptionStatus: "ACTIVE", subscriptionExpiresAt: expiresAt },
      }),
    ]);

    await notify(payment.sellerAccount.userId, "PAYMENT_CONFIRMED", "Payment confirmed", "Your subscription payment was confirmed and your subscription is now active.");
  } else {
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: { status: "REJECTED", confirmedAt: new Date(), confirmedById: admin.id },
    });
    await notify(payment.sellerAccount.userId, "PAYMENT_REJECTED", "Payment rejected", "Your submitted proof of payment was rejected. Please check the details and resubmit.");
  }

  return NextResponse.json({ ok: true });
}
