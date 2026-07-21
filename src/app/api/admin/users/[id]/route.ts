import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const bodySchema = z.object({ action: z.enum(["verify-seller", "make-admin", "make-buyer"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  if (parsed.data.action === "verify-seller") {
    await prisma.sellerAccount.updateMany({ where: { userId: params.id }, data: { verified: true } });
  } else if (parsed.data.action === "make-admin") {
    await prisma.user.update({ where: { id: params.id }, data: { role: "ADMIN" } });
  } else if (parsed.data.action === "make-buyer") {
    await prisma.user.update({ where: { id: params.id }, data: { role: "BUYER" } });
  }

  return NextResponse.json({ ok: true });
}
