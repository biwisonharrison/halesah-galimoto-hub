import { NextResponse } from "next/server";
import { requireDeveloper } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteBackupFile } from "@/lib/backup";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const backup = await prisma.backup.findUnique({ where: { id: params.id } });
  if (!backup) return NextResponse.json({ error: "Backup not found." }, { status: 404 });

  await deleteBackupFile(backup);
  return NextResponse.json({ ok: true });
}
