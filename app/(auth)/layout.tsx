import Link from "next/link";

import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main
      className="flex min-h-dvh items-center justify-center px-4 py-12"
      style={{ background: "var(--lb-gold)" }}
    >
      <div className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="font-display text-2xl font-black tracking-[-0.03em] text-lb-ink"
          >
            Linkbase
          </Link>
        </div>
        <div
          className="rounded-3xl bg-lb-white p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
