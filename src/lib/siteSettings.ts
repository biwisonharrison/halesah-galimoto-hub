import "server-only";
import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@prisma/client";

const SINGLETON_ID = "singleton";

/** Fetches the site settings row, creating it with defaults on first use. */
export async function getSiteSettings(): Promise<SiteSettings> {
  return prisma.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

/**
 * Updates site settings, snapshotting the previous state into
 * SiteSettingsHistory first so changes can be restored later (the Developer
 * Panel's "undo" / version history feature).
 */
export async function updateSiteSettings(
  data: Partial<Omit<SiteSettings, "id" | "updatedAt">>,
  changedById?: string
): Promise<SiteSettings> {
  const current = await getSiteSettings();

  await prisma.siteSettingsHistory.create({
    data: { snapshot: current as object, changedById },
  });

  return prisma.siteSettings.update({ where: { id: SINGLETON_ID }, data });
}

export async function restoreSiteSettingsFromHistory(historyId: string, changedById?: string): Promise<SiteSettings> {
  const entry = await prisma.siteSettingsHistory.findUniqueOrThrow({ where: { id: historyId } });
  const snapshot = entry.snapshot as Record<string, unknown>;
  const { id, updatedAt, ...restorable } = snapshot;

  return updateSiteSettings(restorable as Partial<Omit<SiteSettings, "id" | "updatedAt">>, changedById);
}

export async function resetSiteSettingsToDefaults(changedById?: string): Promise<SiteSettings> {
  const current = await getSiteSettings();
  await prisma.siteSettingsHistory.create({ data: { snapshot: current as object, changedById } });
  await prisma.siteSettings.delete({ where: { id: SINGLETON_ID } }).catch(() => null);
  return getSiteSettings();
}
