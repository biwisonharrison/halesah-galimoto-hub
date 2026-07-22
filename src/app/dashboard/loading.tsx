export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200" />

      <div className="mt-8 h-28 animate-pulse rounded-2xl bg-gray-200" />
      <div className="mt-8 h-40 animate-pulse rounded-2xl bg-gray-200" />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
