import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { notify } from "@/lib/notifications";

const bodySchema = z
  .object({
    action: z.enum(["enable", "disable"]),
    sellerIds: z.array(z.string()).optional(),
    all: z.boolean().optional(),
  })
  .refine((v) => v.all || (v.sellerIds && v.sellerIds.length > 0), "Select at least one seller or choose all.");

export async function POST(req: Request) {
  try {
    await requireManager();
  } catch {
    return NextResponse.json({ error: "Manager access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const status = parsed.data.action === "enable" ? "ENABLED" : "DISABLED";
  const where = parsed.data.all ? {} : { id: { in: parsed.data.sellerIds } };

  const affected = await prisma.sellerAccount.findMany({ where, select: { id: true, userId: true } });
  await prisma.sellerAccount.updateMany({ where, data: { sharingStatus: status } });

  const title = parsed.data.action === "enable" ? "Inventory sharing enabled" : "Inventory sharing disabled";
  const body =
    parsed.data.action === "enable"
      ? "A site manager enabled inventory sharing for your account. Your public inventory link is live again."
      : "A site manager disabled inventory sharing for your account. Your public inventory link is no longer accessible.";
  const type = parsed.data.action === "enable" ? "SELLER_SHARING_ENABLED" : "SELLER_SHARING_DISABLED";

  await Promise.all(affected.map((seller) => notify(seller.userId, type, title, body)));

  return NextResponse.json({ ok: true, count: affected.length });
}
