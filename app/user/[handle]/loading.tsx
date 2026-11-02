/**
 * Suspense boundary for the public profile. With `cacheComponents` the
 * handle-scoped DB read is request-time, so it streams in behind this skeleton
 * (`docs/routing.md` §4). Mirrors the page composition so the shell doesn't
 * jump when content arrives.
 */
export default function PublicProfileLoading() {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-lb-app px-4 py-12 md:py-16">
      <div
        className="h-9 w-9 rounded-lg bg-lb-ink"
        aria-hidden
      />

      <div className="mt-8 flex w-full max-w-[580px] flex-col items-center">
        <div
          className="h-24 w-24 animate-pulse rounded-full bg-lb-gray-200"
          aria-hidden
        />
        <div
          className="mt-4 h-5 w-36 animate-pulse rounded-lg bg-lb-gray-200"
          aria-hidden
        />
        <div
          className="mt-2 h-3.5 w-24 animate-pulse rounded-lg bg-lb-gray-200"
          aria-hidden
        />

        <div className="mt-8 flex w-full flex-col gap-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-white shadow-lb-card"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
