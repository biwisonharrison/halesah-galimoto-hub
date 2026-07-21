export default function MaintenancePage({ message }: { message?: string | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 text-center text-white">
      <div>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1a5 5 0 0 1-6.6 6.6L6.6 21.2a2 2 0 0 1-2.8-2.8L12.2 10a5 5 0 0 1 6.6-6.6l-3.1 3.1Z" />
          </svg>
        </span>
        <h1 className="mt-6 text-2xl font-bold">We&apos;ll be right back</h1>
        <p className="mt-3 max-w-md text-white/70">
          {message || "The site is undergoing scheduled maintenance. Please check back shortly."}
        </p>
      </div>
    </div>
  );
}
