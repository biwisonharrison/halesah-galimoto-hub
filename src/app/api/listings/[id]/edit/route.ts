import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  PHOTO_CATEGORY_VALUES,
  REQUIRED_PHOTO_CATEGORIES,
  MAX_IMAGES_PER_CATEGORY,
  photoCategoryLabel,
} from "@/lib/photoCategories";

const photoSchema = z.object({
  url: z.string().min(1),
  category: z.enum(PHOTO_CATEGORY_VALUES),
});

const bodySchema = z
  .object({
    brandName: z.string().min(1),
    modelName: z.string().min(1),
    year: z.number().int().gte(1950).lte(new Date().getFullYear() + 1),
    priceMwk: z.number().positive(),
    mileageKm: z.number().int().gte(0),
    transmission: z.enum(["MANUAL", "AUTOMATIC"]),
    fuelType: z.string().trim().max(40).optional(),
    bodyType: z.string().trim().max(40).optional(),
    engineCc: z.number().int().positive().optional(),
    seating: z.number().int().positive().optional(),
    drivetrain: z.enum(["TWO_WD", "FOUR_WD", "AWD"]).optional(),
    saleCondition: z.enum(["NEW", "FOREIGN_USED", "LOCALLY_USED", "FOR_PARTS"]),
    condition: z.string().min(1),
    description: z.string().max(2000).optional(),
    districtId: z.string().optional(),
    districtName: z.string().trim().min(1).max(80).optional(),
    videoUrl: z.string().trim().max(500).optional(),
    photos: z.array(photoSchema).max(MAX_IMAGES_PER_CATEGORY * PHOTO_CATEGORY_VALUES.length).default([]),
    resubmit: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const counts = new Map<string, number>();
    for (const photo of data.photos) counts.set(photo.category, (counts.get(photo.category) ?? 0) + 1);

    if (data.resubmit) {
      for (const required of REQUIRED_PHOTO_CATEGORIES) {
        if (!counts.get(required)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Add at least one ${photoCategoryLabel(required)} photo.`, path: ["photos"] });
        }
      }
    }
    for (const [category, count] of counts) {
      if (count > MAX_IMAGES_PER_CATEGORY) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${photoCategoryLabel(category)} allows at most ${MAX_IMAGES_PER_CATEGORY} photos.`, path: ["photos"] });
      }
    }
  });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const isStaff = user.role === "ADMIN" || user.role === "DEVELOPER";
  if (listing.sellerId !== user.id && !isStaff) return NextResponse.json({ error: "You don't own this listing." }, { status: 403 });
  if (!isStaff && !["DRAFT", "PENDING_APPROVAL", "ACTIVE", "HIDDEN", "REJECTED"].includes(listing.status)) {
    return NextResponse.json({ error: "This listing can't be edited right now." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your listing details." }, { status: 400 });
  }
  const data = parsed.data;

  let districtId = data.districtId;
  if (data.districtName) {
    const district = await prisma.district.upsert({
      where: { name: data.districtName },
      update: {},
      create: { name: data.districtName },
    });
    districtId = district.id;
  }

  const nextStatus = data.resubmit && (listing.status === "DRAFT" || listing.status === "REJECTED") ? "PENDING_APPROVAL" : listing.status;

  await prisma.$transaction([
    prisma.listingPhoto.deleteMany({ where: { listingId: listing.id } }),
    prisma.listing.update({
      where: { id: listing.id },
      data: {
        title: `${data.brandName} ${data.modelName} ${data.year}`,
        brandName: data.brandName,
        modelName: data.modelName,
        year: data.year,
        priceMwk: data.priceMwk,
        mileageKm: data.mileageKm,
        transmission: data.transmission,
        fuelType: data.fuelType,
        bodyType: data.bodyType,
        engineCc: data.engineCc,
        seating: data.seating,
        drivetrain: data.drivetrain,
        saleCondition: data.saleCondition,
        condition: data.condition,
        description: data.description,
        videoUrl: data.videoUrl,
        districtId,
        status: nextStatus,
        reviewNotes: nextStatus === "PENDING_APPROVAL" ? null : listing.reviewNotes,
        photos: { create: data.photos.map((photo, position) => ({ url: photo.url, category: photo.category, position })) },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
