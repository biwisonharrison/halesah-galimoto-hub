import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notifications";

const patchSchema = z.object({
  action: z.enum(["mark-sold", "reactivate", "hide", "remove", "feature", "unfeature"]),
});

const FREE_LISTING_DAYS = 30;

async function assertOwnerOrAdmin(listingId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Log in first." }, { status: 401 }) };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: NextResponse.json({ error: "Listing not found." }, { status: 404 }) };

  if (listing.sellerId !== user.id && user.role !== "ADMIN" && user.role !== "DEVELOPER") {
    return { error: NextResponse.json({ error: "You don't own this listing." }, { status: 403 }) };
  }

  return { user, listing };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const check = await assertOwnerOrAdmin(params.id);
  if (check.error) return check.error;
  const { user, listing } = check;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const isAdmin = user.role === "ADMIN" || user.role === "DEVELOPER";

  if ((parsed.data.action === "hide" || parsed.data.action === "remove") && !isAdmin) {
    return NextResponse.json(
      { error: "Sellers can't remove listings directly. Submit a deletion request instead." },
      { status: 403 }
    );
  }

  if ((parsed.data.action === "feature" || parsed.data.action === "unfeature") && !isAdmin) {
    return NextResponse.json({ error: "Only staff can feature a listing." }, { status: 403 });
  }

  let data: Record<string, unknown> = {};
  if (parsed.data.action === "mark-sold") data = { status: "SOLD" };
  if (parsed.data.action === "reactivate") {
    data = { status: "ACTIVE", expiresAt: new Date(Date.now() + FREE_LISTING_DAYS * 24 * 60 * 60 * 1000) };
  }
  if (parsed.data.action === "hide") data = { status: "HIDDEN" };
  if (parsed.data.action === "remove") data = { status: "DELETED" };
  if (parsed.data.action === "feature") data = { featured: true };
  if (parsed.data.action === "unfeature") data = { featured: false };

  const updated = await prisma.listing.update({ where: { id: params.id }, data });

  if (isAdmin && listing.sellerId !== user.id) {
    if (parsed.data.action === "hide") {
      await notify(listing.sellerId, "LISTING_HIDDEN", "Listing hidden", `Your listing "${listing.title}" was hidden by an admin.`);
    }
    if (parsed.data.action === "remove") {
      await notify(listing.sellerId, "LISTING_REMOVED", "Listing removed", `Your listing "${listing.title}" was removed by an admin.`);
    }
  }

  return NextResponse.json({ listing: updated });
}
