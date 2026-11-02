import type { ReactNode } from "react";

/**
 * Full-viewport shell for the onboarding step — a centered split card on a calm
 * surface, distinct from the `(auth)` card chrome.
 */
export default function OnboardingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main
      className="flex min-h-dvh items-center justify-center px-4 py-8 md:py-12"
      style={{ background: "var(--lb-surface-app)" }}
    >
      {children}
    </main>
  );
}
