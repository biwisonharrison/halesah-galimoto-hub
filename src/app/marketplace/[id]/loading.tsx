export default function ListingDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-gray-200" />
          <div className="mt-2 grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
          <div className="mt-6 h-6 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-8 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-gray-200" />
        </div>

        <aside className="space-y-6">
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
        </aside>
      </div>
    </div>
  );
}
