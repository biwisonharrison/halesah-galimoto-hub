import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { notify } from "@/lib/notifications";

const patchSchema = z.object({ action: z.enum(["enable", "disable", "suspend", "restore"]) });

const ACTION_DETAILS = {
  enable: {
    status: "ENABLED" as const,
    type: "SELLER_SHARING_ENABLED" as const,
    title: "Inventory sharing enabled",
    body: "A site manager enabled inventory sharing for your account. Your public inventory link is live again.",
  },
  restore: {
    status: "ENABLED" as const,
    type: "SELLER_SHARING_ENABLED" as const,
    title: "Inventory sharing restored",
    body: "A site manager restored inventory sharing for your account. Your public inventory link is live again.",
  },
  disable: {
    status: "DISABLED" as const,
    type: "SELLER_SHARING_DISABLED" as const,
    title: "Inventory sharing disabled",
    body: "A site manager disabled inventory sharing for your account. Your public inventory link is no longer accessible.",
  },
  suspend: {
    status: "SUSPENDED" as const,
    type: "SELLER_SHARING_SUSPENDED" as const,
    title: "Inventory sharing suspended",
    body: "A site manager suspended inventory sharing for your account. Your public inventory link is no longer accessible.",
  },
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireManager();
  } catch {
    return NextResponse.json({ error: "Manager access required." }, { status: 403 });
  }

  const account = await prisma.sellerAccount.findUnique({ where: { id: params.id } });
  if (!account) return NextResponse.json({ error: "Seller account not found." }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const details = ACTION_DETAILS[parsed.data.action];
  await prisma.sellerAccount.update({ where: { id: account.id }, data: { sharingStatus: details.status } });
  await notify(account.userId, details.type, details.title, details.body);

  return NextResponse.json({ ok: true });
}
