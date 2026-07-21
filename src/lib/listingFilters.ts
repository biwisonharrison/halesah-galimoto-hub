import type { Prisma, Transmission, SellerType, Drivetrain, SaleCondition } from "@prisma/client";

export interface MarketplaceSearchParams {
  [key: string]: string | undefined;
  q?: string;
  brand?: string;
  model?: string;
  district?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  sellerType?: string;
  seating?: string;
  drivetrain?: string;
  /** "new" | "used" (shorthand tabs) or an exact SaleCondition value */
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

export function buildListingWhere(params: MarketplaceSearchParams): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };
  const and: Prisma.ListingWhereInput[] = [];

  if (params.q) {
    and.push({
      OR: [
        { title: { contains: params.q, mode: "insensitive" } },
        { brandName: { contains: params.q, mode: "insensitive" } },
        { modelName: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ],
    });
  }
  if (params.brand) and.push({ brandName: { equals: params.brand, mode: "insensitive" } });
  if (params.model) and.push({ modelName: { equals: params.model, mode: "insensitive" } });
  if (params.district) and.push({ district: { name: params.district } });
  if (params.bodyType) and.push({ bodyType: { equals: params.bodyType, mode: "insensitive" } });
  if (params.fuelType) and.push({ fuelType: { equals: params.fuelType, mode: "insensitive" } });
  if (params.transmission) and.push({ transmission: params.transmission as Transmission });
  if (params.sellerType) and.push({ sellerType: params.sellerType as SellerType });
  if (params.drivetrain) and.push({ drivetrain: params.drivetrain as Drivetrain });
  if (params.minPrice) and.push({ priceMwk: { gte: Number(params.minPrice) } });
  if (params.maxPrice) and.push({ priceMwk: { lte: Number(params.maxPrice) } });

  if (params.seating) {
    if (params.seating === "8+") {
      and.push({ seating: { gte: 8 } });
    } else {
      and.push({ seating: Number(params.seating) });
    }
  }

  if (params.condition === "new") {
    and.push({ saleCondition: "NEW" });
  } else if (params.condition === "used") {
    and.push({ saleCondition: { in: ["FOREIGN_USED", "LOCALLY_USED"] } });
  } else if (params.condition) {
    and.push({ saleCondition: params.condition as SaleCondition });
  }

  if (and.length) where.AND = and;
  return where;
}

export function buildListingOrderBy(sort?: string): Prisma.ListingOrderByWithRelationInput {
  switch (sort) {
    case "cheapest":
      return { priceMwk: "asc" };
    case "most-viewed":
      return { viewCount: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}
