import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const bodySchema = z.object({ reason: z.string().trim().min(5).max(500) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to report a listing." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Tell us briefly what's wrong (at least 5 characters)." }, { status: 400 });
  }

  await prisma.report.create({
    data: { listingId: params.id, reporterId: user.id, reason: parsed.data.reason },
  });

  return NextResponse.json({ ok: true });
}
