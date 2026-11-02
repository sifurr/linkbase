import Link from "next/link";

/**
 * The logged-out header pill (Log in / Sign up). Also the `<Suspense>` fallback
 * for the header's session read, so the static shell shows this instantly and
 * swaps to the user menu only once the session resolves.
 */
export function AuthLinks() {
  return (
    <div
      className="flex items-center gap-[clamp(8px,1.6vw,14px)] rounded-full bg-lb-white py-2 pl-[clamp(14px,2vw,18px)] pr-[clamp(10px,1.6vw,14px)]"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <Link
        href="/login"
        className="rounded-full px-2 py-1.5 text-sm font-bold text-lb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink focus-visible:ring-offset-2"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="inline-flex h-9 items-center justify-center rounded-full bg-lb-action px-4 text-sm font-bold tracking-[-0.01em] text-lb-white transition hover:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        Sign up free
      </Link>
    </div>
  );
}
