import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/auth";

const FREE_LISTING_DAYS = 30;

const bodySchema = z.object({
  action: z.enum(["publish", "unpublish", "archive", "restore", "reserve", "mark-sold", "delete", "feature", "unfeature", "duplicate"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id }, include: { photos: true } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  if (parsed.data.action === "duplicate") {
    const copy = await prisma.listing.create({
      data: {
        sellerId: listing.sellerId,
        sellerType: listing.sellerType,
        carModelId: listing.carModelId,
        title: `${listing.title} (copy)`,
        brandName: listing.brandName,
        modelName: listing.modelName,
        year: listing.year,
        priceMwk: listing.priceMwk,
        mileageKm: listing.mileageKm,
        transmission: listing.transmission,
        fuelType: listing.fuelType,
        bodyType: listing.bodyType,
        engineCc: listing.engineCc,
        seating: listing.seating,
        drivetrain: listing.drivetrain,
        saleCondition: listing.saleCondition,
        condition: listing.condition,
        description: listing.description,
        districtId: listing.districtId,
        status: "DRAFT",
        photos: {
          create: listing.photos.map((p) => ({ url: p.url, category: p.category, position: p.position })),
        },
      },
    });
    return NextResponse.json({ listing: copy });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.action === "publish") {
    data.status = "ACTIVE";
    data.expiresAt = new Date(Date.now() + FREE_LISTING_DAYS * 24 * 60 * 60 * 1000);
  }
  if (parsed.data.action === "unpublish") data.status = "HIDDEN";
  if (parsed.data.action === "archive") data.status = "ARCHIVED";
  if (parsed.data.action === "restore") {
    data.status = "ACTIVE";
    data.expiresAt = new Date(Date.now() + FREE_LISTING_DAYS * 24 * 60 * 60 * 1000);
  }
  if (parsed.data.action === "reserve") data.status = "RESERVED";
  if (parsed.data.action === "mark-sold") data.status = "SOLD";
  if (parsed.data.action === "delete") data.status = "DELETED";
  if (parsed.data.action === "feature") data.featured = true;
  if (parsed.data.action === "unfeature") data.featured = false;

  const updated = await prisma.listing.update({ where: { id: params.id }, data });
  return NextResponse.json({ listing: updated });
}
