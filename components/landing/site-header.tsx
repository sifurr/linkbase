import Link from "next/link";
import { Suspense } from "react";

import { AuthLinks } from "@/components/auth/auth-links";
import { HeaderAuth } from "@/components/auth/header-auth";

export function SiteHeader() {
  return (
    <div className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,24px)]">
      <nav className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="rounded-full bg-lb-white px-[clamp(16px,2.5vw,24px)] py-3 font-display text-[clamp(20px,2.4vw,24px)] font-black tracking-[-0.03em] text-lb-ink"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          Linkbase
        </Link>
        {/* Session read streams in behind the boundary; the fallback is the
            logged-out pill so the static shell renders instantly. */}
        <Suspense fallback={<AuthLinks />}>
          <HeaderAuth />
        </Suspense>
      </nav>
    </div>
  );
}
