import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/photoCategories";
import { saveUploadedFile } from "@/lib/storage";

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

  const filename = `${randomUUID()}.${EXTENSIONS[file.type] ?? "mp4"}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await saveUploadedFile("videos", filename, bytes);

  return NextResponse.json({ url });
}
