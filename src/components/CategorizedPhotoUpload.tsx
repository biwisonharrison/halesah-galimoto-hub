"use client";

import { useState } from "react";
import {
  PHOTO_CATEGORIES,
  REQUIRED_PHOTO_CATEGORIES,
  MAX_IMAGES_PER_CATEGORY,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/photoCategories";

export interface CategorizedPhoto {
  url: string;
  category: string;
}

export default function CategorizedPhotoUpload({
  photos,
  onChange,
}: {
  photos: CategorizedPhoto[];
  onChange: (photos: CategorizedPhoto[]) => void;
}) {
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesSelected(category: string, files: FileList | null) {
    if (!files || !files.length) return;
    setError(null);

    const existingCount = photos.filter((p) => p.category === category).length;
    const remainingSlots = MAX_IMAGES_PER_CATEGORY - existingCount;
    if (remainingSlots <= 0) {
      setError(`You've already added the maximum of ${MAX_IMAGES_PER_CATEGORY} photos for this category.`);
      return;
    }

    const candidates = Array.from(files).slice(0, remainingSlots);
    const valid: File[] = [];
    for (const file of candidates) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError("Only JPG, PNG or WEBP photos are allowed.");
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError("Each photo must be under 5MB.");
        continue;
      }
      valid.push(file);
    }
    if (!valid.length) return;

    setUploadingCategory(category);
    try {
      const uploaded: CategorizedPhoto[] = [];
      for (const file of valid) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        uploaded.push({ url: data.url, category });
      }
      onChange([...photos, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingCategory(null);
    }
  }

  function removePhoto(url: string) {
    onChange(photos.filter((p) => p.url !== url));
  }

  return (
    <div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <p className="mb-4 text-sm text-gray-500">
        Add photos for each part of the car. <strong>Outer View, Seats and Dashboard</strong> need at least one
        photo each; the rest are optional. Up to {MAX_IMAGES_PER_CATEGORY} photos per category, 5MB max each (JPG,
        PNG or WEBP).
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PHOTO_CATEGORIES.map((cat) => {
          const categoryPhotos = photos.filter((p) => p.category === cat.value);
          const isRequired = REQUIRED_PHOTO_CATEGORIES.includes(cat.value);
          const isUploading = uploadingCategory === cat.value;
          const canAddMore = categoryPhotos.length < MAX_IMAGES_PER_CATEGORY;

          return (
            <div key={cat.value} className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{cat.label}</span>
                {isRequired ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Required
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Optional</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {categoryPhotos.map((photo) => (
                  <div key={photo.url} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.url)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {canAddMore && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-center hover:border-brand-400">
                    <input
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(",")}
                      multiple
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        handleFilesSelected(cat.value, e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <span className="text-xl text-gray-400">{isUploading ? "…" : "+"}</span>
                  </label>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {categoryPhotos.length}/{MAX_IMAGES_PER_CATEGORY}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
