import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifyAllAdmins } from "@/lib/notifications";

const bodySchema = z.object({ reason: z.string().trim().max(500).optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (listing.sellerId !== user.id) return NextResponse.json({ error: "You don't own this listing." }, { status: 403 });
  if (listing.status === "PENDING_DELETION" || listing.status === "DELETED") {
    return NextResponse.json({ error: "A deletion request is already in progress for this listing." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Check your request." }, { status: 400 });

  await prisma.$transaction([
    prisma.listingDeletionRequest.create({
      data: {
        listingId: listing.id,
        sellerId: user.id,
        reason: parsed.data.reason,
        previousStatus: listing.status,
      },
    }),
    prisma.listing.update({ where: { id: listing.id }, data: { status: "PENDING_DELETION" } }),
  ]);

  await notifyAllAdmins(
    "ADMIN_DELETION_REQUEST",
    "Listing deletion requested",
    `A seller requested deletion of "${listing.title}".`
  );

  return NextResponse.json({ ok: true });
}
