import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(5).max(2000),
  sellerId: z.string().trim().optional(),
  listingId: z.string().trim().optional(),
  displayAnonymously: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Log in to leave a review." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your review details." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.sellerId) {
    const seller = await prisma.user.findUnique({ where: { id: data.sellerId } });
    if (!seller) return NextResponse.json({ error: "Seller not found." }, { status: 404 });
  }
  if (data.listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: data.listingId } });
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      authorId: user.id,
      subjectId: data.sellerId,
      listingId: data.listingId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      displayAnonymously: data.displayAnonymously ?? false,
    },
  });

  return NextResponse.json({ ok: true, id: review.id });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = 12;

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where: { status: "APPROVED" },
      include: {
        author: { select: { name: true } },
        subject: { select: { name: true, sellerAccount: { select: { businessName: true } } } },
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where: { status: "APPROVED" } }),
  ]);

  return NextResponse.json({
    reviews: reviews.map(formatPublicReview),
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    page,
  });
}

function formatPublicReview(review: {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  displayAnonymously: boolean;
  createdAt: Date;
  author: { name: string | null };
  subject: { name: string | null; sellerAccount: { businessName: string | null } | null } | null;
  listing: { title: string } | null;
}) {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    createdAt: review.createdAt,
    authorName: review.displayAnonymously ? "Anonymous" : review.author.name ?? "Anonymous",
    sellerName: review.subject ? review.subject.sellerAccount?.businessName ?? review.subject.name : null,
    listingTitle: review.listing?.title ?? null,
  };
}
