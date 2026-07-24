import "server-only";
import { prisma } from "@/lib/prisma";
import type { SellerSharingSettings, Prisma } from "@prisma/client";

const SINGLETON_ID = "singleton";

/** Top-level route segments already owned by other pages — a configured urlPrefix must avoid these. */
export const RESERVED_URL_PREFIXES = [
  "dashboard",
  "developer",
  "admin",
  "manager",
  "api",
  "marketplace",
  "brands",
  "lookup",
  "classics",
  "blog",
  "login",
  "sell",
  "account",
  "reviews",
  "safety-guide",
  "become-a-seller",
  "_next",
];

/** Fetches the seller-sharing settings row, creating it with defaults on first use. */
export async function getSellerSharingSettings(): Promise<SellerSharingSettings> {
  return prisma.sellerSharingSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function updateSellerSharingSettings(
  data: Partial<Omit<SellerSharingSettings, "id" | "updatedAt" | "updatedById">>,
  updatedById?: string
): Promise<SellerSharingSettings> {
  await getSellerSharingSettings();
  return prisma.sellerSharingSettings.update({
    where: { id: SINGLETON_ID },
    data: { ...data, updatedById } as Prisma.SellerSharingSettingsUncheckedUpdateInput,
  });
}
