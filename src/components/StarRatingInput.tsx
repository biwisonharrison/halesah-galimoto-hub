"use client";

import { useState } from "react";

export default function StarRatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            className={`text-2xl leading-none ${n <= shown ? "text-amber-500" : "text-gray-300"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
