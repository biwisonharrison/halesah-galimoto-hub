import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  priceMwk: z.number().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const plan = await prisma.subscriptionPlan.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ plan });
}
