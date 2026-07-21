export default function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? "text-amber-500" : "text-gray-300"}>
          ★
        </span>
      ))}
    </div>
  );
}
