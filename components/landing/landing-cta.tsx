import { ClaimForm } from "@/components/landing/claim-form";

export function LandingCta() {
  return (
    <section
      className="px-[clamp(20px,4vw,28px)] py-[clamp(56px,8vw,96px)]"
      style={{ background: "var(--lb-purple-deep)", color: "#ffffff" }}
    >
      <div className="mx-auto max-w-[720px] text-center">
        <h2
          className="m-0 mx-auto mb-2.5 max-w-[620px] font-display text-[clamp(32px,4.6vw,52px)] font-black leading-[1.02] tracking-[-0.02em] [text-wrap:pretty]"
          style={{ color: "var(--lb-lime)" }}
        >
          Your corner of the internet is waiting.
        </h2>
        <p className="m-0 mx-auto mb-7 max-w-[440px] text-lg opacity-90">
          Claim your Linkbase today — it takes less than a minute.
        </p>
        <div className="mx-auto flex max-w-[460px] justify-center">
          <ClaimForm variant="action" />
        </div>
      </div>
    </section>
  );
}
