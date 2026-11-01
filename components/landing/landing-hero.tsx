import { ClaimForm } from "@/components/landing/claim-form";
import { SiteHeader } from "@/components/landing/site-header";
import { SocialIcon, type SocialName } from "@/components/landing/social-icon";

const PREVIEW_LINKS = [
  "Latest photo series →",
  "Print shop",
  "Book a shoot",
  "Newsletter",
];

const PREVIEW_SOCIALS: SocialName[] = ["instagram", "youtube", "twitter"];

export function LandingHero() {
  return (
    <section
      className="pt-[18px]"
      style={{ background: "var(--lb-lime)", color: "var(--lb-ink)" }}
    >
      <SiteHeader />

      <div className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(32px,5vw,56px)] px-[clamp(20px,4vw,28px)] pb-[clamp(48px,7vw,88px)] pt-[clamp(40px,6vw,72px)]">
        <div className="min-w-0">
          <h1 className="m-0 font-display text-[clamp(40px,6.2vw,68px)] font-black leading-[0.98] tracking-[-0.02em] [text-wrap:pretty]">
            Everything you are. In one simple link.
          </h1>
          <p className="mb-[26px] mt-[22px] max-w-[460px] text-[clamp(16px,1.5vw,19px)] font-medium leading-[1.45] opacity-90">
            One link in bio to share everything you create, curate and sell. Join
            70M+ people who grow their audience with Linkbase.
          </p>
          <ClaimForm variant="primary" />
          <p className="mt-3.5 text-xs font-medium opacity-70">
            Free forever. No credit card needed.
          </p>
        </div>

        <div className="flex min-w-0 justify-center">
          <div
            className="w-[min(290px,78vw)] rounded-[36px] bg-lb-white px-3.5 pb-5 pt-3.5"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <div className="mx-auto mb-4 mt-1 h-[5px] w-[42px] rounded-full bg-lb-gray-200" />
            <div className="flex flex-col items-center gap-1 px-1.5 pb-3.5">
              <div
                className="h-16 w-16 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--lb-magenta), var(--lb-gold))",
                  boxShadow: "var(--shadow-sm)",
                }}
              />
              <div className="mt-1.5 text-[15px] font-extrabold text-lb-ink">
                @avarivera
              </div>
              <div
                className="text-[11px] font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Photographer · Berlin
              </div>
            </div>
            <div className="flex flex-col gap-2.5 px-1.5">
              {PREVIEW_LINKS.map((title) => (
                <div
                  key={title}
                  className="rounded-2xl bg-lb-gray-100 px-3.5 py-[13px] text-center text-[13px] font-bold text-lb-ink"
                  style={{ boxShadow: "var(--shadow-xs)" }}
                >
                  {title}
                </div>
              ))}
            </div>
            <div
              className="flex justify-center gap-3 px-1.5 pt-4"
              style={{ color: "var(--lb-gray-600)" }}
            >
              {PREVIEW_SOCIALS.map((name) => (
                <span key={name} className="opacity-75">
                  <SocialIcon name={name} size={18} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
