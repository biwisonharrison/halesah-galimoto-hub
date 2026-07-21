import { prisma } from "@/lib/prisma";
import AdminCatalogueForms from "@/components/AdminCatalogueForms";

export default async function AdminCataloguePage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { models: true } } },
  });

  return (
    <div>
      <AdminCatalogueForms brands={brands.map((b) => ({ id: b.id, name: b.name }))} />

      <h2 className="mt-10 text-lg font-semibold text-ink">Existing brands ({brands.length})</h2>
      <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {brands.map((brand) => (
          <div key={brand.id} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-ink">{brand.name}</span>
            <span className="text-gray-500">{brand._count.models} models</span>
          </div>
        ))}
      </div>
    </div>
  );
}
