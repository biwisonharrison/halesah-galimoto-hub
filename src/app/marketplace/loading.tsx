export default function MarketplaceLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="aspect-[4/3] w-full animate-pulse bg-gray-200" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
