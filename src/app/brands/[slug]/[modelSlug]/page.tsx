import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BrandModelPage({ params }: { params: { slug: string; modelSlug: string } }) {
  const brand = await prisma.brand.findUnique({ where: { slug: params.slug } });
  if (!brand) notFound();

  const model = await prisma.carModel.findUnique({
    where: { brandId_slug: { brandId: brand.id, slug: params.modelSlug } },
  });
  if (!model) notFound();

  redirect(`/lookup/results?brand=${brand.slug}&model=${model.slug}`);
}
