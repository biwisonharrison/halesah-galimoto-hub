import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  priceMwk: z.number().positive(),
  durationDays: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the plan details." }, { status: 400 });
  }

  const plan = await prisma.subscriptionPlan.create({ data: parsed.data });
  return NextResponse.json({ plan });
}
