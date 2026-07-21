import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireDeveloper } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BACKUP_DIR } from "@/lib/backup";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const backup = await prisma.backup.findUnique({ where: { id: params.id } });
  if (!backup || backup.status !== "COMPLETED") {
    return NextResponse.json({ error: "That backup isn't available to download." }, { status: 404 });
  }

  const bytes = await readFile(path.join(BACKUP_DIR, backup.filename)).catch(() => null);
  if (!bytes) return NextResponse.json({ error: "Backup file is missing on disk." }, { status: 404 });

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${backup.filename}"`,
    },
  });
}
