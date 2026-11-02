import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import type { Metadata } from "next";

import { Avatar } from "@/components/ui/avatar";
import { getPublicProfile } from "@/lib/links/queries";

type PublicProfilePageProps = {
  // Next.js 16: dynamic route params are async and must be awaited.
  params: Promise<{ handle: string }>;
};

/**
 * The one public route (`docs/routing.md` §1, `docs/auth.md` §3): open to
 * everyone, scoped to the route `handle`, rendering only profile-safe data.
 *
 * Layout + styling follow the design system (`docs/design-system.md`,
 * `docs/ui.md`): a centered link column (`--width-link-column` 580px) with the
 * brand mark, the profile header, the LinkCard **centered** variant for each
 * link, and the "Join … on Linkbase" footer pill. A pure Server Component —
 * the DB read streams in behind the route's `loading.tsx` boundary.
 */
export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  // Request-time render: the DB read uses Mongoose timestamps (`new Date()`),
  // which can't run during the static prerender under `cacheComponents`.
  await connection();
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) {
    return { title: "Profile not found · Linkbase" };
  }

  const display = profile.name ?? profile.handle;
  return {
    title: `${display} · Linkbase`,
    description: `${display}'s links on Linkbase.`,
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  // Request-time render before the DB read (see `generateMetadata`).
  await connection();
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) {
    notFound();
  }

  const display = profile.name ?? profile.handle;

  return (
    <main className="flex min-h-dvh flex-col items-center bg-lb-app px-4 py-12 md:py-16">
      {/* Brand mark — wordmark rendered in type (no logo file per design system) */}
      <Link
        href="/"
        aria-label="Linkbase home"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-lb-ink text-lb-white shadow-lb-sm transition-[filter] duration-150 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink focus-visible:ring-offset-2 motion-reduce:transition-none"
        style={{ fontWeight: "var(--fw-black)", fontSize: "var(--fs-lg)" }}
      >
        L
      </Link>

      <div className="mt-8 flex w-full max-w-[580px] flex-col items-center">
        {/* Profile header */}
        <header className="flex flex-col items-center text-center">
          <Avatar name={display} size={96} />
          <h1
            className="mt-4 font-bold text-lb-ink"
            style={{
              fontSize: "var(--fs-lg)",
              lineHeight: 1.2,
              letterSpacing: "var(--ls-snug)",
            }}
          >
            {display}
          </h1>
          <p
            className="mt-1 text-lb-gray-500"
            style={{ fontSize: "var(--fs-sm)" }}
          >
            @{profile.handle}
          </p>
        </header>

        {/* Link stack — LinkCard centered variant (docs/ui.md) */}
        <section className="mt-8 flex w-full flex-col gap-3">
          {profile.links.length === 0 ? (
            <p
              className="text-center text-lb-gray-500"
              style={{ fontSize: "var(--fs-sm)", padding: "24px 8px" }}
            >
              No links yet.
            </p>
          ) : (
            profile.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-2xl bg-white text-center font-bold text-lb-ink shadow-lb-card transition-[transform,box-shadow] duration-150 ease-[ease] [text-wrap:pretty] hover:shadow-lb-md active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink focus-visible:ring-offset-2"
                style={{
                  padding: "20px 18px",
                  fontSize: "var(--fs-body)",
                  letterSpacing: "var(--ls-snug)",
                  wordBreak: "break-word",
                }}
              >
                {link.title}
              </a>
            ))
          )}
        </section>

        {/* Footer pill */}
        <footer className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white text-lb-ink shadow-lb-sm transition-[filter] duration-150 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink focus-visible:ring-offset-2 motion-reduce:transition-none"
            style={{
              fontSize: "var(--fs-xs)",
              fontWeight: "var(--fw-semibold)",
              padding: "10px 18px",
            }}
          >
            Join {display} on Linkbase
          </Link>
        </footer>
      </div>
    </main>
  );
}
