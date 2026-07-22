import { NextResponse } from "next/server";
import { requireDeveloper } from "@/lib/auth";
import { ALL_PROVIDERS } from "@/lib/otpProviders/registry";

export async function GET() {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const catalog = ALL_PROVIDERS.map((p) => ({
    key: p.key,
    label: p.label,
    channel: p.channel,
    icon: p.icon,
    fields: p.fields,
    notes: p.notes,
  }));

  return NextResponse.json({ providers: catalog });
}
