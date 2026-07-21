"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import CarIllustration from "./CarIllustration";
import { PHOTO_CATEGORIES } from "@/lib/photoCategories";

export interface GalleryPhoto {
  id: string;
  url: string;
  category: string;
}

export default function ListingGallery({
  photos,
  featured,
  fallbackBodyType,
  fallbackSeed,
  fallbackLabel,
}: {
  photos: GalleryPhoto[];
  featured?: boolean;
  fallbackBodyType: string | null;
  fallbackSeed: string;
  fallbackLabel: string;
}) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeIndex, setActiveIndex] = useState(0);

  const availableCategories = useMemo(
    () => PHOTO_CATEGORIES.filter((cat) => photos.some((p) => p.category === cat.value)),
    [photos]
  );

  const filteredPhotos = activeCategory === "ALL" ? photos : photos.filter((p) => p.category === activeCategory);
  const mainPhoto = filteredPhotos[activeIndex] ?? filteredPhotos[0];

  function selectCategory(value: string) {
    setActiveCategory(value);
    setActiveIndex(0);
  }

  return (
    <div>
      {photos.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => selectCategory("ALL")}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              activeCategory === "ALL"
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700"
            }`}
          >
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => selectCategory(cat.value)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                activeCategory === cat.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
        {featured && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}
        {mainPhoto ? (
          <Image src={mainPhoto.url} alt={fallbackLabel} fill priority className="object-cover" />
        ) : (
          <CarIllustration bodyType={fallbackBodyType} seed={fallbackSeed} label={fallbackLabel} />
        )}
      </div>

      {filteredPhotos.length > 1 && (
        <div className="mt-2 grid grid-cols-5 gap-2">
          {filteredPhotos.slice(0, 15).map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                i === activeIndex ? "ring-2 ring-brand-500" : ""
              }`}
            >
              <Image src={photo.url} alt="" fill loading="lazy" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
