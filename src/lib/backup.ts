import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, stat, unlink, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, updateSiteSettings } from "@/lib/siteSettings";
import type { Backup } from "@prisma/client";

const execFileAsync = promisify(execFile);

export const BACKUP_DIR = path.join(process.cwd(), "backups");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function fileSize(filePath: string): Promise<number | null> {
  try {
    return (await stat(filePath)).size;
  } catch {
    return null;
  }
}

/**
 * Shells out to pg_dump/psql/tar rather than reimplementing them — these are
 * the real, correct tools for the job and are expected to already be on PATH
 * on any machine that can run `prisma migrate`.
 */
export async function createDatabaseBackup(createdById?: string): Promise<Backup> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const filename = `db-${timestamp()}.sql`;
  const record = await prisma.backup.create({ data: { type: "DATABASE", filename, createdById } });

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL is not set.");
    const filePath = path.join(BACKUP_DIR, filename);
    await execFileAsync("pg_dump", [databaseUrl, "-f", filePath]);
    const sizeBytes = await fileSize(filePath);
    return prisma.backup.update({ where: { id: record.id }, data: { status: "COMPLETED", sizeBytes } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "pg_dump failed.";
    return prisma.backup.update({ where: { id: record.id }, data: { status: "FAILED", errorMessage: message.slice(0, 500) } });
  }
}

export async function createConfigBackup(createdById?: string): Promise<Backup> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const filename = `config-${timestamp()}.json`;
  const record = await prisma.backup.create({ data: { type: "CONFIG", filename, createdById } });

  try {
    const [settings, homepageSections] = await Promise.all([
      getSiteSettings(),
      prisma.homepageSection.findMany(),
    ]);
    const filePath = path.join(BACKUP_DIR, filename);
    await writeFile(filePath, JSON.stringify({ settings, homepageSections }, null, 2));
    const sizeBytes = await fileSize(filePath);
    return prisma.backup.update({ where: { id: record.id }, data: { status: "COMPLETED", sizeBytes } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Config export failed.";
    return prisma.backup.update({ where: { id: record.id }, data: { status: "FAILED", errorMessage: message.slice(0, 500) } });
  }
}

export async function createMediaBackup(createdById?: string): Promise<Backup> {
  await mkdir(BACKUP_DIR, { recursive: true });
  const filename = `media-${timestamp()}.tar.gz`;
  const record = await prisma.backup.create({ data: { type: "MEDIA", filename, createdById } });

  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filePath = path.join(BACKUP_DIR, filename);
    await execFileAsync("tar", ["-czf", filePath, "-C", path.dirname(UPLOADS_DIR), "uploads"]);
    const sizeBytes = await fileSize(filePath);
    return prisma.backup.update({ where: { id: record.id }, data: { status: "COMPLETED", sizeBytes } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Media archive failed.";
    return prisma.backup.update({ where: { id: record.id }, data: { status: "FAILED", errorMessage: message.slice(0, 500) } });
  }
}

export async function restoreDatabaseBackup(filename: string): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set.");
  const filePath = path.join(BACKUP_DIR, filename);
  await stat(filePath);
  await execFileAsync("psql", [databaseUrl, "-f", filePath]);
}

export async function restoreConfigBackup(filename: string, changedById?: string): Promise<void> {
  const filePath = path.join(BACKUP_DIR, filename);
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as { settings?: Record<string, unknown>; homepageSections?: Array<Record<string, unknown>> };

  if (parsed.settings) {
    const { id, updatedAt, ...restorable } = parsed.settings;
    await updateSiteSettings(restorable as never, changedById);
  }
  if (parsed.homepageSections) {
    for (const section of parsed.homepageSections) {
      if (typeof section.id !== "string") continue;
      const { id, ...rest } = section;
      await prisma.homepageSection.update({ where: { id }, data: rest as never }).catch(() => null);
    }
  }
}

export async function deleteBackupFile(backup: Backup): Promise<void> {
  await unlink(path.join(BACKUP_DIR, backup.filename)).catch(() => null);
  await prisma.backup.delete({ where: { id: backup.id } });
}
