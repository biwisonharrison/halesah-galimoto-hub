import "server-only";
import { prisma } from "@/lib/prisma";
import type { OtpSettings, Prisma } from "@prisma/client";

const SINGLETON_ID = "singleton";

export async function getOtpSettings(): Promise<OtpSettings> {
  return prisma.otpSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function updateOtpSettings(data: Partial<Omit<OtpSettings, "id" | "updatedAt">>, updatedById?: string) {
  return prisma.otpSettings.update({
    where: { id: SINGLETON_ID },
    data: { ...data, updatedById } as Prisma.OtpSettingsUncheckedUpdateInput,
  });
}

export async function resetOtpSettings(updatedById?: string) {
  await prisma.otpSettings.delete({ where: { id: SINGLETON_ID } }).catch(() => null);
  return getOtpSettings();
}

export function getChannelPriority(settings: OtpSettings): string[] {
  if (Array.isArray(settings.channelPriority)) return settings.channelPriority as string[];
  return ["SMS", "WHATSAPP", "EMAIL"];
}
