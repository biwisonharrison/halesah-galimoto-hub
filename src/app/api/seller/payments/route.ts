import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notify, notifyAllAdmins } from "@/lib/notifications";

const bodySchema = z.object({
  amountMwk: z.number().positive(),
  planId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  proofUrl: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  if (!user.sellerAccount) return NextResponse.json({ error: "You need a seller account first." }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your payment details." }, { status: 400 });
  }

  const payment = await prisma.subscriptionPayment.create({
    data: {
      sellerAccountId: user.sellerAccount.id,
      amountMwk: parsed.data.amountMwk,
      planId: parsed.data.planId,
      paymentMethodId: parsed.data.paymentMethodId,
      proofUrl: parsed.data.proofUrl,
      notes: parsed.data.notes,
    },
  });

  await notify(user.id, "PAYMENT_SUBMITTED", "Payment submitted", "Your proof of payment was submitted and is awaiting confirmation.");
  await notifyAllAdmins("ADMIN_PAYMENT_PROOF", "Proof of payment uploaded", `${user.sellerAccount.businessName} submitted proof of payment.`);

  return NextResponse.json({ ok: true, paymentId: payment.id });
}
