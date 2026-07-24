import "server-only";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { sellerAccount: true },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!user.active) throw new Error("ACCOUNT_SUSPENDED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "DEVELOPER") throw new Error("FORBIDDEN");
  return user;
}

export async function requireDeveloper() {
  const user = await requireUser();
  if (user.role !== "DEVELOPER") throw new Error("FORBIDDEN");
  return user;
}

export async function requireManager() {
  const user = await requireUser();
  if (user.role !== "MANAGER" && user.role !== "ADMIN" && user.role !== "DEVELOPER") throw new Error("FORBIDDEN");
  return user;
}

export async function requireApprovedSeller() {
  const user = await requireUser();
  if (!user.sellerAccount || user.sellerAccount.status !== "APPROVED") {
    throw new Error("NOT_APPROVED_SELLER");
  }
  return user;
}
