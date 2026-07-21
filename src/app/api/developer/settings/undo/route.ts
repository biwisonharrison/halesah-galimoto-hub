import { NextResponse } from "next/server";
import { requireDeveloper } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restoreSiteSettingsFromHistory } from "@/lib/siteSettings";

export async function POST() {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const lastChange = await prisma.siteSettingsHistory.findFirst({ orderBy: { createdAt: "desc" } });
  if (!lastChange) {
    return NextResponse.json({ error: "There is no earlier version to restore." }, { status: 400 });
  }

  const settings = await restoreSiteSettingsFromHistory(lastChange.id, developer.id);
  return NextResponse.json({ settings });
}
