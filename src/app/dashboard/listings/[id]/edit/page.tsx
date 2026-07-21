import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditListingForm from "@/components/EditListingForm";

export const metadata = { title: "Edit listing · Halesah Galimoto Hub" };

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/dashboard/listings/${params.id}/edit`);

  const [listing, districts] = await Promise.all([
    prisma.listing.findUnique({
      where: { id: params.id },
      include: { photos: { orderBy: { position: "asc" } } },
    }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!listing) notFound();
  const isStaff = user.role === "ADMIN" || user.role === "DEVELOPER";
  if (listing.sellerId !== user.id && !isStaff) notFound();
  if (!isStaff && !["DRAFT", "PENDING_APPROVAL", "ACTIVE", "HIDDEN", "REJECTED"].includes(listing.status)) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">Edit listing</h1>
      <p className="mt-2 text-gray-600">{listing.title}</p>
      {listing.status === "REJECTED" && listing.reviewNotes && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Feedback from review: {listing.reviewNotes}
        </p>
      )}
      <div className="mt-8">
        <EditListingForm
          listing={{
            id: listing.id,
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
            status: listing.status,
            photos: listing.photos.map((p) => ({ url: p.url, category: p.category })),
            videoUrl: listing.videoUrl,
          }}
          districts={districts}
        />
      </div>
    </div>
  );
}
