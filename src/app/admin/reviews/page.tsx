import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";
import StarRating from "@/components/StarRating";
import AdminReviewActions from "@/components/AdminReviewActions";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-brand-100 text-brand-800",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function AdminReviewsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status === "all" ? undefined : searchParams.status ?? "PENDING";

  const reviews = await prisma.review.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {},
    include: {
      author: { select: { name: true, phone: true } },
      subject: { select: { name: true, sellerAccount: { select: { businessName: true } } } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Reviews ({reviews.length})</h2>
        <div className="flex gap-2 text-sm">
          {[
            { key: "PENDING", label: "Pending" },
            { key: "APPROVED", label: "Approved" },
            { key: "REJECTED", label: "Rejected" },
            { key: "all", label: "All" },
          ].map((tab) => (
            <a
              key={tab.key}
              href={`/admin/reviews?status=${tab.key}`}
              className={`rounded-lg px-3 py-1.5 font-medium ${
                (status ?? "all") === tab.key || (!status && tab.key === "all")
                  ? "bg-ink text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-gray-500">Nothing here.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <StarRating rating={review.rating} />
                  {review.title && <p className="mt-1 font-semibold text-ink">{review.title}</p>}
                  <p className="mt-1 text-sm text-gray-600">&quot;{review.comment}&quot;</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {review.displayAnonymously ? "Anonymous" : review.author.name ?? review.author.phone}
                    {review.subject && ` · about ${review.subject.sellerAccount?.businessName ?? review.subject.name}`}
                    {review.listing && ` · ${review.listing.title}`}
                    {" · "}
                    {timeAgo(review.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[review.status]}`}>
                    {review.status}
                  </span>
                  <AdminReviewActions
                    reviewId={review.id}
                    status={review.status}
                    title={review.title}
                    comment={review.comment}
                    rating={review.rating}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
