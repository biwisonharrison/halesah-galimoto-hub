import { NextResponse } from "next/server";
import { requireDeveloper } from "@/lib/auth";
import { resetSiteSettingsToDefaults } from "@/lib/siteSettings";

export async function POST() {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const settings = await resetSiteSettingsToDefaults(developer.id);
  return NextResponse.json({ settings });
}
