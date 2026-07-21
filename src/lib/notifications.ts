import "server-only";
import { prisma } from "@/lib/prisma";

type NotificationType =
  | "REGISTRATION_APPROVED"
  | "REGISTRATION_REJECTED"
  | "LISTING_SUBMITTED"
  | "LISTING_APPROVED"
  | "LISTING_REJECTED"
  | "LISTING_CHANGES_REQUESTED"
  | "LISTING_HIDDEN"
  | "LISTING_REMOVED"
  | "DELETION_REQUESTED"
  | "DELETION_APPROVED"
  | "DELETION_REJECTED"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_REJECTED"
  | "TRIAL_ENDING_7"
  | "TRIAL_ENDING_3"
  | "SUBSCRIPTION_EXPIRED"
  | "ADMIN_NEW_SELLER"
  | "ADMIN_NEW_LISTING"
  | "ADMIN_DELETION_REQUEST"
  | "ADMIN_PAYMENT_PROOF";

/**
 * Sends a notification to a user and logs it to their in-app notification feed.
 *
 * "Sending" over email/WhatsApp is a console-log placeholder (same pattern as
 * the OTP provider in src/lib/otp.ts) — there's no SendGrid/WhatsApp Business
 * API account wired up. Swap deliverEmail/deliverWhatsApp for real providers
 * before launch; the calling code and DB log don't need to change.
 */
export async function notify(userId: string, type: NotificationType, title: string, body: string): Promise<void> {
  await prisma.notification.create({ data: { userId, type, title, body } });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true, email: true } });
  deliverEmail(user?.email ?? null, title, body);
  deliverWhatsApp(user?.phone ?? null, title, body);
}

function deliverEmail(email: string | null, title: string, body: string): void {
  console.log(`[NOTIFY:EMAIL] to=${email ?? "(no email on file)"} | ${title} | ${body}`);
}

function deliverWhatsApp(phone: string | null, title: string, body: string): void {
  console.log(`[NOTIFY:WHATSAPP] to=${phone ?? "(no phone)"} | ${title} | ${body}`);
}

export async function notifyAllAdmins(type: NotificationType, title: string, body: string): Promise<void> {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(admins.map((admin) => notify(admin.id, type, title, body)));
}
