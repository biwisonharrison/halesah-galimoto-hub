import "server-only";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

/**
 * Generates a unique SellerAccount.slug from a business name, appending
 * -2, -3, ... on collision (business names aren't unique, unlike Brand/CarModel
 * slugs which have a natural unique key to rely on).
 */
export async function generateSellerSlug(businessName: string, excludeSellerAccountId?: string): Promise<string> {
  const base = slugify(businessName) || "seller";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.sellerAccount.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeSellerAccountId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
