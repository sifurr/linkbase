import { connection } from "next/server";

import type { Metadata } from "next";

import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard · Linkbase",
  robots: { index: false, follow: false },
};

/**
 * Placeholder dashboard — the signed-in home. The proxy gate guarantees the
 * visitor is authenticated and has a handle; `requireUser` is a server-side
 * backstop. Real content comes in a later feature.
 */
export default async function DashboardPage() {
  // Per-session page: force request-time rendering before the session read so
  // it isn't attempted during the static-shell prerender under `cacheComponents`.
  await connection();
  await requireUser();

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <h1
        className="font-display font-black tracking-[-0.02em]"
        style={{ fontSize: "var(--fs-title)", color: "var(--lb-ink)" }}
      >
        Dashboard
      </h1>
    </main>
  );
}
