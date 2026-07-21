export const metadata = { title: "Blog · Halesah Galimoto Hub" };

const PLACEHOLDER_POSTS = [
  { title: "How to spot a fair price on a used Toyota Hilux", tag: "Buying guide" },
  { title: "Best cars for Malawian roads under MWK 10m", tag: "Buying guide" },
  { title: "This week's fuel price update", tag: "News" },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">Blog & news</h1>
      <p className="mt-2 text-gray-600">
        Fuel price updates, MRA rule changes, and buying guides for the Malawian market. Coming soon.
      </p>
      <div className="mt-8 space-y-3">
        {PLACEHOLDER_POSTS.map((post) => (
          <div key={post.title} className="rounded-xl border border-dashed border-gray-300 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">{post.tag}</p>
            <h2 className="mt-1 font-semibold text-ink">{post.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
