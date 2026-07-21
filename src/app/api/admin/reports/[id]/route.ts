import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const bodySchema = z.object({ action: z.enum(["dismiss", "action"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  if (parsed.data.action === "action") {
    await prisma.listing.update({ where: { id: report.listingId }, data: { status: "DELETED" } });
    await prisma.report.update({ where: { id: report.id }, data: { status: "ACTIONED" } });
  } else {
    await prisma.report.update({ where: { id: report.id }, data: { status: "DISMISSED" } });
  }

  return NextResponse.json({ ok: true });
}
