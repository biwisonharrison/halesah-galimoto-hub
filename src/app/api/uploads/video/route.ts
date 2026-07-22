import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/photoCategories";

// Same local-disk store as the photo upload route — see the note there.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "videos");
const ALLOWED_TYPES = new Set(ALLOWED_VIDEO_TYPES);
const EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to upload a video." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only MP4, WebM or MOV videos are allowed." }, { status: 400 });
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return NextResponse.json({ error: "Video must be under 75MB." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${EXTENSIONS[file.type] ?? "mp4"}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return NextResponse.json({ url: `/uploads/videos/${filename}` });
}
