export default function ReviewsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
