"use client";

import { AuthError } from "@/components/auth/auth-error";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="w-full max-w-[420px] rounded-3xl p-8"
      style={{ background: "var(--lb-white)", boxShadow: "var(--shadow-card)" }}
    >
      <AuthError error={error} reset={reset} />
    </div>
  );
}
