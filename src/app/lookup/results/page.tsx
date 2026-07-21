import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMWK } from "@/lib/format";
import StarRating from "@/components/StarRating";
import CarIllustration from "@/components/CarIllustration";

export const metadata = { title: "Lookup results · Halesah Galimoto Hub" };

const BODY_LABELS: Record<string, string> = {
  SEDAN: "Sedan",
  HATCHBACK: "Hatchback",
  SUV: "SUV",
  PICKUP: "Pickup",
  VAN: "Van",
  MINIBUS: "Minibus",
  WAGON: "Wagon",
  COUPE: "Coupe",
  TRUCK: "Truck",
  MOTORCYCLE: "Motorcycle",
};

const DRIVETRAIN_LABELS: Record<string, string> = {
  TWO_WD: "2WD",
  FOUR_WD: "4WD",
  AWD: "AWD",
};

export default async function LookupResultsPage({
  searchParams,
}: {
  searchParams: { brand?: string; model?: string; year?: string };
}) {
  const { brand: brandSlug, model: modelSlug } = searchParams;
  if (!brandSlug || !modelSlug) notFound();

  const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
  if (!brand) notFound();

  const model = await prisma.carModel.findUnique({
    where: { brandId_slug: { brandId: brand.id, slug: modelSlug } },
    include: { photos: true },
  });
  if (!model) notFound();

  const priceAgg = await prisma.listing.aggregate({
    where: { carModelId: model.id, status: "ACTIVE" },
    _avg: { priceMwk: true },
    _count: true,
  });

  const estimatedValue = priceAgg._avg.priceMwk ?? model.baseValueMwk ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm text-gray-500">
        <Link href="/lookup" className="hover:underline">
          Car lookup
        </Link>{" "}
        / {brand.name}
      </p>
      <h1 className="mt-1 text-3xl font-bold text-ink">
        {brand.name} {model.name}
      </h1>
      <p className="text-gray-500">
        {model.yearStart} {model.yearEnd ? `to ${model.yearEnd}` : "to present"} · {BODY_LABELS[model.bodyType]}
      </p>

      <div className="relative mt-6 h-56 w-full overflow-hidden rounded-2xl">
        <CarIllustration bodyType={model.bodyType} seed={model.slug} label={`${brand.name} ${model.name}`} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-ink">Overview</h2>
            <p className="mt-2 text-gray-700">{model.description}</p>
            <p className="mt-2 text-sm text-gray-500">
              {brand.name} origin: {brand.originCountry}. {brand.history}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink">Strengths & common faults</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
                <h3 className="text-sm font-semibold text-brand-800">Known strengths</h3>
                <p className="mt-1 text-sm text-brand-900">{model.strengths ?? "Not documented yet."}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-semibold text-amber-800">Common faults</h3>
                <p className="mt-1 text-sm text-amber-900">{model.faults ?? "Not documented yet."}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Community editable and moderated. Spotted something wrong? Let us know once accounts open up.
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Estimated Malawi value</h3>
            <p className="mt-2 text-2xl font-bold text-brand-700">
              {estimatedValue ? formatMWK(estimatedValue) : "Not enough data yet"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {priceAgg._count > 0
                ? `Based on ${priceAgg._count} live listing${priceAgg._count === 1 ? "" : "s"} on Halesah Galimoto Hub.`
                : "No live listings yet, showing a rough baseline estimate."}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Key specs</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Spec label="Engine" value={model.engineCc ? `${model.engineCc} cc` : "Not specified"} />
              <Spec label="Fuel type" value={model.fuelType} />
              <Spec label="Drivetrain" value={DRIVETRAIN_LABELS[model.drivetrain]} />
              <Spec label="Seating" value={model.seating ? `${model.seating} seats` : "Not specified"} />
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Spare part availability
            </h3>
            <div className="mt-2">
              <StarRating rating={model.partAvailabilityRating ?? 0} />
            </div>
            <p className="mt-1 text-xs text-gray-500">Community rated.</p>
          </div>

          <Link
            href={`/marketplace?brand=${encodeURIComponent(brand.name)}&model=${encodeURIComponent(model.name)}`}
            className="block rounded-lg bg-ink px-4 py-3 text-center font-semibold text-white hover:bg-ink/90"
          >
            See all {model.name} cars for sale →
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
