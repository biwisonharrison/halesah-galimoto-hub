import "server-only";
import type { SellerAccount } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export const TRIAL_DURATION_DAYS = 30;

export function daysRemaining(date: Date | null | undefined): number {
  if (!date) return 0;
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/** Whether this seller account currently has an active trial or paid subscription. */
export function hasActiveAccess(account: Pick<SellerAccount, "status" | "subscriptionStatus" | "trialEndsAt" | "subscriptionExpiresAt">): boolean {
  if (account.status !== "APPROVED") return false;
  if (account.subscriptionStatus === "TRIAL") return Boolean(account.trialEndsAt && account.trialEndsAt.getTime() > Date.now());
  if (account.subscriptionStatus === "ACTIVE") return Boolean(account.subscriptionExpiresAt && account.subscriptionExpiresAt.getTime() > Date.now());
  return false;
}

/**
 * Checks a seller account's trial/subscription expiry and reacts accordingly:
 * sends 7-day/3-day warning notifications once each, flips an expired trial or
 * subscription to EXPIRED, and hides that seller's currently-active listings.
 *
 * There's no background job runner in this app, so this runs lazily whenever a
 * seller-facing page loads (dashboard, sell wizard) rather than on a real daily
 * cron — it's always accurate by the time a seller actually looks at the page,
 * which is the only time it matters.
 */
export async function ensureSellerSubscriptionCurrent(sellerAccountId: string): Promise<void> {
  const account = await prisma.sellerAccount.findUnique({ where: { id: sellerAccountId } });
  if (!account || account.status !== "APPROVED") return;

  if (account.subscriptionStatus === "TRIAL" && account.trialEndsAt) {
    const remaining = daysRemaining(account.trialEndsAt);

    if (remaining <= 0) {
      await prisma.sellerAccount.update({ where: { id: account.id }, data: { subscriptionStatus: "EXPIRED" } });
      await prisma.listing.updateMany({
        where: { sellerId: account.userId, status: "ACTIVE" },
        data: { status: "HIDDEN" },
      });
      await notify(
        account.userId,
        "SUBSCRIPTION_EXPIRED",
        "Your free trial has ended",
        "Your 30-day free trial has ended and your active listings have been hidden. Submit a subscription payment to reactivate them."
      );
      return;
    }

    if (remaining <= 3 && !account.trial3DayNoticeSentAt) {
      await prisma.sellerAccount.update({ where: { id: account.id }, data: { trial3DayNoticeSentAt: new Date() } });
      await notify(account.userId, "TRIAL_ENDING_3", "Your trial ends in 3 days", "Your free trial ends in 3 days. Submit a payment to keep your listings live.");
    } else if (remaining <= 7 && !account.trial7DayNoticeSentAt) {
      await prisma.sellerAccount.update({ where: { id: account.id }, data: { trial7DayNoticeSentAt: new Date() } });
      await notify(account.userId, "TRIAL_ENDING_7", "Your trial ends in 7 days", "Your free trial ends in 7 days. Submit a payment to keep your listings live after it ends.");
    }
    return;
  }

  if (account.subscriptionStatus === "ACTIVE" && account.subscriptionExpiresAt) {
    const remaining = daysRemaining(account.subscriptionExpiresAt);
    if (remaining <= 0) {
      await prisma.sellerAccount.update({ where: { id: account.id }, data: { subscriptionStatus: "EXPIRED" } });
      await prisma.listing.updateMany({
        where: { sellerId: account.userId, status: "ACTIVE" },
        data: { status: "HIDDEN" },
      });
      await notify(
        account.userId,
        "SUBSCRIPTION_EXPIRED",
        "Your subscription has expired",
        "Your subscription has expired and your active listings have been hidden. Renew your payment to reactivate them."
      );
    }
  }
}
