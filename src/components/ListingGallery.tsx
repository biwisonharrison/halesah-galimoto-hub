"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import CarIllustration from "./CarIllustration";
import { PHOTO_CATEGORIES } from "@/lib/photoCategories";

const SWIPE_THRESHOLD_PX = 50;

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
  const photoCount = filteredPhotos.length;
  const touchStartX = useRef<number | null>(null);

  function selectCategory(value: string) {
    setActiveCategory(value);
    setActiveIndex(0);
  }

  function goNext() {
    if (photoCount < 2) return;
    setActiveIndex((prev) => (prev + 1) % photoCount);
  }

  function goPrev() {
    if (photoCount < 2) return;
    setActiveIndex((prev) => (prev - 1 + photoCount) % photoCount);
  }

  useEffect(() => {
    if (photoCount < 2) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photoCount]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD_PX) goPrev();
    else if (delta < -SWIPE_THRESHOLD_PX) goNext();
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

      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {featured && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}
        {mainPhoto ? (
          <div key={mainPhoto.id} className="animate-fade-in absolute inset-0">
            <Image src={mainPhoto.url} alt={fallbackLabel} fill priority className="object-cover" />
          </div>
        ) : (
          <CarIllustration bodyType={fallbackBodyType} seed={fallbackSeed} label={fallbackLabel} />
        )}

        {photoCount > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="absolute bottom-2 right-2 z-10 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
              {activeIndex + 1} / {photoCount}
            </span>
          </>
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
