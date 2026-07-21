import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({ action: z.enum(["approve", "reject"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const request_ = await prisma.listingDeletionRequest.findUnique({
    where: { id: params.id },
    include: { listing: true },
  });
  if (!request_) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (request_.status !== "PENDING") return NextResponse.json({ error: "This request was already resolved." }, { status: 409 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const approve = parsed.data.action === "approve";

  await prisma.$transaction([
    prisma.listingDeletionRequest.update({
      where: { id: request_.id },
      data: { status: approve ? "APPROVED" : "REJECTED", resolvedAt: new Date(), resolvedById: admin.id },
    }),
    prisma.listing.update({
      where: { id: request_.listingId },
      data: { status: approve ? "DELETED" : request_.previousStatus },
    }),
  ]);

  await notify(
    request_.sellerId,
    approve ? "DELETION_APPROVED" : "DELETION_REJECTED",
    approve ? "Deletion request approved" : "Deletion request rejected",
    approve
      ? `Your request to delete "${request_.listing.title}" was approved.`
      : `Your request to delete "${request_.listing.title}" was rejected. The listing has been restored.`
  );

  return NextResponse.json({ ok: true });
}
