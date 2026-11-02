import Link from "next/link";

import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 — Page not found · Linkbase",
  description: "The page you are looking for does not exist or has moved.",
};

/**
 * Root not-found UI. Next.js renders this both for thrown `notFound()` calls
 * and for any URL that matches no route, so it stays brand-aligned, static, and
 * server-rendered (no client hooks). See
 * `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`.
 */
export default function NotFound() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: "var(--lb-lime)", color: "var(--lb-ink)" }}
    >
      <Link
        href="/"
        className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-lb-white px-5 py-3 font-display text-[22px] font-black tracking-[-0.03em] text-lb-ink"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        Linkbase
      </Link>

      <p
        className="font-display font-black leading-none"
        style={{
          fontSize: "clamp(96px, 22vw, 200px)",
          letterSpacing: "var(--ls-tight)",
        }}
      >
        404
      </p>

      <h1
        className="mt-2 font-display font-black leading-[1.05] tracking-[-0.02em]"
        style={{ fontSize: "clamp(24px, 4vw, 36px)" }}
      >
        This page took a wrong link.
      </h1>

      <p
        className="mx-auto mt-4 max-w-[440px] font-medium leading-[1.5]"
        style={{ fontSize: "var(--fs-lg)", opacity: 0.85 }}
      >
        The page you’re looking for doesn’t exist, moved, or the link is broken.
        Let’s get you back on track.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="primary" size="md">
            Back to home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="md">
            Go to dashboard
          </Button>
        </Link>
      </div>
    </main>
  );
}
