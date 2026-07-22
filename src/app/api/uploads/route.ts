import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/photoCategories";

// Local-disk upload store for the MVP. Works for a single-server / self-hosted
// deployment; swap for S3-compatible object storage before deploying to a
// serverless/multi-instance host where the filesystem isn't persistent.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "listings");
const ALLOWED_TYPES = new Set(ALLOWED_IMAGE_TYPES);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to upload photos." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG or WEBP photos are allowed." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json({ error: "Photo must be under 5MB." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return NextResponse.json({ url: `/uploads/listings/${filename}` });
}
