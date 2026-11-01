"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

type FaqItem = {
  q: string;
  a: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is Linkbase really free?",
    a: "Yes. The free plan lets you build your page, add unlimited links and share it anywhere — forever, with no credit card required. Paid plans add deeper customization, analytics and a custom domain when you’re ready.",
  },
  {
    q: "How do I get started?",
    a: "Claim your username above, pick a theme, and start adding links. Most people have a shareable page live in under two minutes — no design or coding skills needed.",
  },
  {
    q: "Can I customize how my page looks?",
    a: "Completely. Choose fonts, colors, button shapes and backgrounds, or start from a ready-made theme. Rearrange links by dragging, and feature what matters most at the top.",
  },
  {
    q: "What analytics do I get?",
    a: "See lifetime and real-time views, clicks and click-through rate for every link, plus where your audience is coming from — so you learn what your followers love and keep them coming back.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. On paid plans you can connect a custom domain so your link reads as yourname.com instead of linkbase.co/yourname. We walk you through the DNS setup step by step.",
  },
  {
    q: "How do I get help if I’m stuck?",
    a: "Browse our help center for guides and answers, or reach our support team by email any day of the week. Paid plans get priority responses.",
  },
];

export function LandingFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section
      className="px-[clamp(20px,4vw,28px)] py-[clamp(48px,7vw,84px)]"
      style={{ background: "var(--lb-surface-app)" }}
    >
      <div className="mx-auto max-w-[760px]">
        <h2 className="m-0 mb-2 text-center font-display text-[clamp(30px,4vw,44px)] font-black leading-[1.05] tracking-[-0.02em] text-lb-ink">
          Questions? Answered.
        </h2>
        <p
          className="m-0 mb-[clamp(28px,4vw,40px)] text-center text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          Everything you need to know before you claim your link.
        </p>
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = open === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl bg-lb-white"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen((current) => (current === index ? -1 : index))}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent p-[clamp(16px,2.4vw,22px)] text-left font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lb-ink"
                >
                  <span className="text-[clamp(15px,1.6vw,18px)] font-bold tracking-[-0.01em] text-lb-ink">
                    {item.q}
                  </span>
                  <span
                    className="flex flex-shrink-0 opacity-55 transition-transform duration-200 ease-out motion-reduce:transition-none"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <Plus size={20} color="var(--lb-ink)" aria-hidden="true" />
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="m-0 px-[clamp(16px,2.4vw,22px)] pb-[clamp(18px,2.4vw,22px)] text-base leading-[1.6]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
