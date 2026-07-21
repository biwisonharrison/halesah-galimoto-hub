import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ensureSellerSubscriptionCurrent, hasActiveAccess } from "@/lib/seller";
import { notify, notifyAllAdmins } from "@/lib/notifications";
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
    carModelId: z.string().optional(),
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
    saleCondition: z.enum(["NEW", "FOREIGN_USED", "LOCALLY_USED", "FOR_PARTS"]).default("FOREIGN_USED"),
    condition: z.string().min(1),
    description: z.string().max(2000).optional(),
    districtId: z.string().optional(),
    districtName: z.string().trim().min(1).max(80).optional(),
    videoUrl: z.string().trim().max(500).optional(),
    photos: z.array(photoSchema).max(MAX_IMAGES_PER_CATEGORY * PHOTO_CATEGORY_VALUES.length).default([]),
    submitForApproval: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const counts = new Map<string, number>();
    for (const photo of data.photos) {
      counts.set(photo.category, (counts.get(photo.category) ?? 0) + 1);
    }

    if (data.submitForApproval) {
      for (const required of REQUIRED_PHOTO_CATEGORIES) {
        if (!counts.get(required)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Add at least one ${photoCategoryLabel(required)} photo.`,
            path: ["photos"],
          });
        }
      }
    }

    for (const [category, count] of counts) {
      if (count > MAX_IMAGES_PER_CATEGORY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${photoCategoryLabel(category)} allows at most ${MAX_IMAGES_PER_CATEGORY} photos.`,
          path: ["photos"],
        });
      }
    }
  });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to list a car." }, { status: 401 });
  if (!user.sellerAccount || user.sellerAccount.status !== "APPROVED") {
    return NextResponse.json({ error: "You need an approved seller account to list a car." }, { status: 403 });
  }

  await ensureSellerSubscriptionCurrent(user.sellerAccount.id);
  const account = await prisma.sellerAccount.findUniqueOrThrow({ where: { id: user.sellerAccount.id } });
  if (!hasActiveAccess(account)) {
    return NextResponse.json({ error: "Your trial or subscription has ended. Submit a payment to keep listing cars." }, { status: 403 });
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

  try {
    const listing = await prisma.listing.create({
      data: {
        sellerId: user.id,
        sellerType: "DEALER",
        carModelId: data.carModelId,
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
        status: data.submitForApproval ? "PENDING_APPROVAL" : "DRAFT",
        photos: {
          create: data.photos.map((photo, position) => ({ url: photo.url, category: photo.category, position })),
        },
      },
    });

    if (data.submitForApproval) {
      await notify(
        user.id,
        "LISTING_SUBMITTED",
        "Listing submitted for approval",
        `Your listing "${listing.title}" was submitted and is awaiting review.`
      );
      await notifyAllAdmins("ADMIN_NEW_LISTING", "New listing submitted", `${listing.title} was submitted for approval.`);
    }

    return NextResponse.json({ ok: true, listingId: listing.id });
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "You already have a listing with this exact brand, model and year. Tweak the title or details." },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to view your listings." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine") === "true";

  const listings = await prisma.listing.findMany({
    where: mine ? { sellerId: user.id } : { status: "ACTIVE" },
    include: { district: true, photos: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}
