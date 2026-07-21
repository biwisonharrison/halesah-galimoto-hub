import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notify } from "@/lib/notifications";

const FREE_LISTING_DAYS = 30;

const bodySchema = z.object({
  action: z.enum(["approve", "reject", "request-changes"]),
  notes: z.string().trim().max(1000).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (listing.status !== "PENDING_APPROVAL") {
    return NextResponse.json({ error: "Only listings pending approval can be reviewed." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { action, notes } = parsed.data;

  if (action === "approve") {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: "ACTIVE", reviewNotes: null, expiresAt: new Date(Date.now() + FREE_LISTING_DAYS * 24 * 60 * 60 * 1000) },
    });
    await notify(listing.sellerId, "LISTING_APPROVED", "Listing approved", `Your listing "${listing.title}" is now live.`);
  } else if (action === "reject") {
    await prisma.listing.update({ where: { id: listing.id }, data: { status: "REJECTED", reviewNotes: notes ?? null } });
    await notify(listing.sellerId, "LISTING_REJECTED", "Listing rejected", notes ?? `Your listing "${listing.title}" was rejected.`);
  } else {
    await prisma.listing.update({ where: { id: listing.id }, data: { status: "DRAFT", reviewNotes: notes ?? null } });
    await notify(
      listing.sellerId,
      "LISTING_CHANGES_REQUESTED",
      "Changes requested on your listing",
      notes ?? `Please update your listing "${listing.title}" and resubmit it for approval.`
    );
  }

  return NextResponse.json({ ok: true });
}
