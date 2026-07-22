"use client";

import { useEffect, useState } from "react";
import StarRating from "./StarRating";

export type TestimonialItem = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  authorName: string;
  sellerName: string | null;
};

export default function ReviewsCarousel({ reviews }: { reviews: TestimonialItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (reviews.length === 0) return null;
  const review = reviews[index];

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
      <div className="flex justify-center">
        <StarRating rating={review.rating} />
      </div>
      {review.title && <p className="mt-2 text-lg font-semibold text-ink">{review.title}</p>}
      <p className="mt-2 text-gray-600">&quot;{review.comment}&quot;</p>
      <p className="mt-3 text-sm font-medium text-gray-500">
        {review.authorName}
        {review.sellerName && ` · ${review.sellerName}`}
      </p>

      {reviews.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {reviews.map((r, i) => (
            <button
              key={r.id}
              aria-label={`Show review ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-brand-600" : "bg-gray-300"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
