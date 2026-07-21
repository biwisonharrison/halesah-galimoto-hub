import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CarIllustration from "@/components/CarIllustration";

export const metadata = { title: "Classic cars · Halesah Galimoto Hub" };

export default async function ClassicsPage() {
  const classics = await prisma.carModel.findMany({
    where: { isClassic: true },
    include: { brand: true, photos: { where: { approved: true } } },
    orderBy: { yearStart: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">Classic car gallery</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Models from before 2000 that Malawians keep running for decades, including Peugeot 404s, old Land Rovers and
        classic Benzes. Photo galleries, restoration stories, and cars still spotted on Malawian roads today.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classics.map((model) => (
          <Link
            key={model.id}
            href={`/brands/${model.brand.slug}/${model.slug}`}
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative h-44 w-full">
              <CarIllustration bodyType={model.bodyType} seed={model.slug} label={`${model.brand.name} ${model.name}`} />
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                {model.yearStart}
                {model.yearEnd ? ` to ${model.yearEnd}` : ""}
              </p>
              <h2 className="mt-1 text-lg font-bold text-ink">
                {model.brand.name} {model.name}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{model.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">Own one of these?</h2>
        <p className="mt-2 text-gray-600">
          Submit photos of your own classic car to the community gallery. Log in, open a classic model&apos;s page,
          and share your story. All submissions are moderated before appearing publicly.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-lg bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink/90"
        >
          Log in to submit a photo
        </Link>
      </div>
    </div>
  );
}
