import { MousePointerClick, Palette, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Reason = {
  icon: LucideIcon;
  tint: string;
  title: string;
  body: string;
};

const REASONS: Reason[] = [
  {
    icon: MousePointerClick,
    tint: "var(--lb-lime)",
    title: "Live in minutes",
    body: "Claim your link, add what matters, and share it anywhere. No design skills, no code — just a page that feels like you.",
  },
  {
    icon: Palette,
    tint: "var(--lb-pink)",
    title: "Truly yours",
    body: "Fonts, colors, buttons, backgrounds. Make it match your brand down to the detail, or start from a theme you love.",
  },
  {
    icon: TrendingUp,
    tint: "var(--lb-cream)",
    title: "Grow on purpose",
    body: "See what your audience clicks in real time and double down on what works. Every tap is an insight.",
  },
];

export function LandingReasons() {
  return (
    <section
      className="px-[clamp(20px,4vw,28px)] py-[clamp(48px,7vw,84px)]"
      style={{ background: "var(--lb-white)" }}
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[clamp(20px,3vw,32px)]">
          {REASONS.map(({ icon: Icon, tint, title, body }) => (
            <div key={title} className="flex flex-col gap-3">
              <div
                className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl"
                style={{ background: tint }}
              >
                <Icon size={24} strokeWidth={2} color="var(--lb-ink)" />
              </div>
              <h3 className="mt-1 font-display text-[clamp(19px,2vw,22px)] font-extrabold tracking-[-0.01em] text-lb-ink">
                {title}
              </h3>
              <p
                className="m-0 text-base leading-[1.5]"
                style={{ color: "var(--text-secondary)" }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
