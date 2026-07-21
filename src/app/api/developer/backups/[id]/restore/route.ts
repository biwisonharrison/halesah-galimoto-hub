import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restoreDatabaseBackup, restoreConfigBackup } from "@/lib/backup";

const bodySchema = z.object({ confirm: z.literal("RESTORE") });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Type "RESTORE" to confirm — this overwrites live data.' }, { status: 400 });
  }

  const backup = await prisma.backup.findUnique({ where: { id: params.id } });
  if (!backup || backup.status !== "COMPLETED") {
    return NextResponse.json({ error: "That backup isn't available to restore." }, { status: 404 });
  }

  if (backup.type === "MEDIA") {
    return NextResponse.json({ error: "Media archives must be restored manually by extracting them into public/uploads." }, { status: 400 });
  }

  try {
    if (backup.type === "DATABASE") await restoreDatabaseBackup(backup.filename);
    if (backup.type === "CONFIG") await restoreConfigBackup(backup.filename, developer.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Restore failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
