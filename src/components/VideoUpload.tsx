"use client";

import { useState } from "react";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES, MAX_VIDEO_DURATION_SECONDS } from "@/lib/photoCategories";

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read this video file."));
    };
    video.src = objectUrl;
  });
}

export default function VideoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError("Only MP4, WebM or MOV videos are allowed.");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setError(`Video must be under ${Math.round(MAX_VIDEO_SIZE_BYTES / (1024 * 1024))}MB.`);
      return;
    }

    setUploading(true);
    try {
      const duration = await readVideoDuration(file);
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        setError(`Video must be ${MAX_VIDEO_DURATION_SECONDS / 60} minute(s) or shorter (this one is ${Math.ceil(duration / 60)} min).`);
        return;
      }

      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads/video", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">Walkaround video (optional)</p>
      <p className="mb-3 text-xs text-gray-500">
        A short video of the car, up to {MAX_VIDEO_DURATION_SECONDS / 60} minute(s) and{" "}
        {Math.round(MAX_VIDEO_SIZE_BYTES / (1024 * 1024))}MB (MP4, WebM or MOV). Buyers can watch it on the listing
        page alongside your photos.
      </p>

      {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {value ? (
        <div className="max-w-sm">
          <video src={value} controls className="w-full rounded-lg bg-black" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="mt-2 text-xs font-medium text-red-600 hover:underline"
          >
            Remove video
          </button>
        </div>
      ) : (
        <label className="flex h-24 w-full max-w-sm cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-center hover:border-brand-400">
          <input
            type="file"
            accept={ALLOWED_VIDEO_TYPES.join(",")}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              handleFileSelected(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="text-sm text-gray-500">{uploading ? "Uploading…" : "+ Add a video"}</span>
        </label>
      )}
    </div>
  );
}
