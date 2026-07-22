import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeMalawiPhone } from "@/lib/phone";

const bodySchema = z.object({
  action: z.enum(["verify-seller", "make-admin", "make-buyer", "edit-login"]),
  phone: z.string().trim().optional(),
  name: z.string().trim().max(120).optional(),
});

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
  } else if (parsed.data.action === "edit-login") {
    const data: { phone?: string; name?: string | null } = {};
    if (parsed.data.phone !== undefined) {
      const normalized = normalizeMalawiPhone(parsed.data.phone);
      if (!normalized) {
        return NextResponse.json({ error: "That doesn't look like a valid Malawian phone number." }, { status: 400 });
      }
      data.phone = normalized;
    }
    if (parsed.data.name !== undefined) {
      data.name = parsed.data.name || null;
    }
    try {
      await prisma.user.update({ where: { id: params.id }, data });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return NextResponse.json({ error: "Another account already uses that phone number." }, { status: 409 });
      }
      throw err;
    }
  }

  return NextResponse.json({ ok: true });
}
