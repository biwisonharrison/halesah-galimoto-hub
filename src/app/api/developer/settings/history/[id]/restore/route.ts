import { NextResponse } from "next/server";
import { requireDeveloper } from "@/lib/auth";
import { restoreSiteSettingsFromHistory } from "@/lib/siteSettings";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const settings = await restoreSiteSettingsFromHistory(params.id, developer.id).catch(() => null);
  if (!settings) {
    return NextResponse.json({ error: "That version could not be found." }, { status: 404 });
  }

  return NextResponse.json({ settings });
}
