import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const bodySchema = z.object({
  label: z.string().trim().min(1).max(100).optional(),
  accountName: z.string().trim().max(100).optional(),
  accountNumber: z.string().trim().max(60).optional(),
  phoneNumber: z.string().trim().max(30).optional(),
  instructions: z.string().trim().max(500).optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const method = await prisma.paymentMethod.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ method });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  await prisma.paymentMethod.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
