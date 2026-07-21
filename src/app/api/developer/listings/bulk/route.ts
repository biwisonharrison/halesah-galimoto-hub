import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/auth";

const FREE_LISTING_DAYS = 30;

const bodySchema = z.object({
  ids: z.array(z.string()).min(1).max(200),
  action: z.enum(["publish", "unpublish", "archive", "restore", "reserve", "mark-sold", "delete", "feature", "unfeature"]),
});

export async function POST(req: Request) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Select at least one listing and a valid action." }, { status: 400 });
  }

  const { ids, action } = parsed.data;
  const data: Record<string, unknown> = {};
  if (action === "publish") {
    data.status = "ACTIVE";
    data.expiresAt = new Date(Date.now() + FREE_LISTING_DAYS * 24 * 60 * 60 * 1000);
  }
  if (action === "unpublish") data.status = "HIDDEN";
  if (action === "archive") data.status = "ARCHIVED";
  if (action === "restore") {
    data.status = "ACTIVE";
    data.expiresAt = new Date(Date.now() + FREE_LISTING_DAYS * 24 * 60 * 60 * 1000);
  }
  if (action === "reserve") data.status = "RESERVED";
  if (action === "mark-sold") data.status = "SOLD";
  if (action === "delete") data.status = "DELETED";
  if (action === "feature") data.featured = true;
  if (action === "unfeature") data.featured = false;

  const result = await prisma.listing.updateMany({ where: { id: { in: ids } }, data });
  return NextResponse.json({ updated: result.count });
}
