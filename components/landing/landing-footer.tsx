import Link from "next/link";

import { SocialIcon, type SocialName } from "@/components/landing/social-icon";

type FooterColumn = {
  head: string;
  items: string[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  { head: "Product", items: ["Templates", "Pricing", "Marketplace", "Discover"] },
  { head: "Company", items: ["About", "Careers", "Blog", "Press"] },
  { head: "Support", items: ["Help center", "Contact", "Status", "Privacy"] },
];

const FOOTER_SOCIALS: SocialName[] = [
  "instagram",
  "twitter",
  "youtube",
  "facebook",
];

export function LandingFooter() {
  return (
    <footer
      className="px-[clamp(20px,4vw,28px)] pb-[clamp(28px,4vw,40px)] pt-[clamp(44px,6vw,64px)]"
      style={{ background: "var(--lb-ink)", color: "#ffffff" }}
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] items-start gap-[clamp(28px,4vw,48px)]">
          <div className="min-w-0">
            <div className="font-display text-[26px] font-black tracking-[-0.03em]">
              Linkbase
            </div>
            <p className="mt-3 max-w-[240px] text-sm leading-[1.5] opacity-60">
              One link to share everything you create, curate and sell.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.head} className="min-w-0">
              <div className="mb-3.5 text-xs font-bold uppercase tracking-[0.04em] opacity-50">
                {col.head}
              </div>
              <div className="flex flex-col gap-[11px]">
                {col.items.map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="text-sm font-medium text-white opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-lb-ink motion-reduce:transition-none"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(32px,4vw,48px)] flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <span className="text-xs opacity-50">
            © 2026 Linkbase. All rights reserved.
          </span>
          <div className="flex gap-2.5">
            {FOOTER_SOCIALS.map((name) => (
              <a
                key={name}
                href="#"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-lb-ink motion-reduce:transition-none"
              >
                <SocialIcon name={name} size={17} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
