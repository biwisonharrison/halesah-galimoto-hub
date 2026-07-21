import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { createDatabaseBackup, createConfigBackup, createMediaBackup } from "@/lib/backup";

const bodySchema = z.object({ type: z.enum(["DATABASE", "CONFIG", "MEDIA"]) });

export async function POST(req: Request) {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a backup type." }, { status: 400 });
  }

  const backup =
    parsed.data.type === "DATABASE"
      ? await createDatabaseBackup(developer.id)
      : parsed.data.type === "CONFIG"
        ? await createConfigBackup(developer.id)
        : await createMediaBackup(developer.id);

  return NextResponse.json({ backup });
}
