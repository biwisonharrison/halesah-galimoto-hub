import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "edit"]),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(5).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const data = parsed.data;

  if (data.action === "approve") {
    await prisma.review.update({ where: { id: review.id }, data: { status: "APPROVED" } });
  } else if (data.action === "reject") {
    await prisma.review.update({ where: { id: review.id }, data: { status: "REJECTED" } });
  } else if (data.action === "edit") {
    await prisma.review.update({
      where: { id: review.id },
      data: {
        title: data.title !== undefined ? data.title : review.title,
        comment: data.comment ?? review.comment,
        rating: data.rating ?? review.rating,
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

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  await prisma.review.delete({ where: { id: review.id } });
  return NextResponse.json({ ok: true });
}
