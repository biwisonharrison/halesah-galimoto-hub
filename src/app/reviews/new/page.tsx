import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReviewForm from "@/components/ReviewForm";

export const metadata = { title: "Leave a review · Halesah Galimoto Hub" };

export default async function LeaveReviewPage({
  searchParams,
}: {
  searchParams: { sellerId?: string; listingId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    const qs = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    redirect(`/login?redirect=${encodeURIComponent(`/reviews/new${qs ? `?${qs}` : ""}`)}`);
  }

  const listing = searchParams.listingId
    ? await prisma.listing.findUnique({
        where: { id: searchParams.listingId },
        include: { seller: { include: { sellerAccount: true } } },
      })
    : null;

  const sellerId = listing ? listing.sellerId : searchParams.sellerId;
  const seller = !listing && sellerId ? await prisma.user.findUnique({ where: { id: sellerId }, include: { sellerAccount: true } }) : listing?.seller;

  const contextLabel = listing
    ? `${listing.title} — sold by ${seller?.sellerAccount?.businessName ?? seller?.name ?? "this seller"}`
    : seller
      ? seller.sellerAccount?.businessName ?? seller.name ?? "this seller"
      : undefined;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-ink">Leave a review</h1>
      <p className="mt-2 text-sm text-gray-600">
        Share your experience buying or selling on Halesah Galimoto Hub. Reviews are checked by our team before they appear publicly.
      </p>
      <div className="mt-8">
        <ReviewForm sellerId={sellerId} listingId={listing?.id} contextLabel={contextLabel} />
      </div>
    </div>
  );
}
