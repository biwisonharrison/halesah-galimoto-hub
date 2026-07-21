import { prisma } from "@/lib/prisma";
import LookupForm from "@/components/LookupForm";

export const metadata = { title: "Car lookup · Halesah Galimoto Hub" };

export default async function LookupPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">Car lookup</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Pick a brand, model and year to see its history, specs and fair Malawian price, all in one place.
      </p>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <LookupForm brands={brands} />
      </div>
    </div>
  );
}
