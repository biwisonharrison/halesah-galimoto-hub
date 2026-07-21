import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Saves an uploaded file and returns its public URL.
 *
 * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set (i.e. deployed on
 * Vercel, or Blob configured locally) — Vercel's servers don't keep files
 * between requests, so local disk can't be used there. Falls back to
 * writing into public/uploads/<folder> for local development, where the
 * filesystem is persistent and this is simpler than requiring Blob for
 * every contributor's machine.
 */
export async function saveUploadedFile(folder: "listings" | "videos", filename: string, bytes: Buffer): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${filename}`, bytes, { access: "public" });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${folder}/${filename}`;
}
