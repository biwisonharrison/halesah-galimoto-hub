import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StarRating from "@/components/StarRating";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "Customer reviews · Halesah Galimoto Hub" };

const PAGE_SIZE = 12;

export default async function ReviewsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where: { status: "APPROVED" },
      include: {
        author: { select: { name: true } },
        subject: { select: { name: true, sellerAccount: { select: { businessName: true } } } },
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.review.count({ where: { status: "APPROVED" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Customer reviews</h1>
          <p className="mt-1 text-gray-600">What buyers and sellers say about Halesah Galimoto Hub.</p>
        </div>
        <Link href="/reviews/new" className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
          Leave a review
        </Link>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">No reviews yet. Be the first to leave one.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <StarRating rating={review.rating} />
              {review.title && <p className="mt-2 font-semibold text-ink">{review.title}</p>}
              <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
              <p className="mt-3 text-xs text-gray-400">
                {review.displayAnonymously ? "Anonymous" : review.author.name ?? "Anonymous"}
                {review.subject && ` · ${review.subject.sellerAccount?.businessName ?? review.subject.name}`}
                {" · "}
                {timeAgo(review.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/reviews?page=${p}`}
              className={`rounded-md px-3 py-1.5 ${p === page ? "bg-brand-600 text-white" : "border border-gray-300 text-ink hover:bg-gray-50"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
