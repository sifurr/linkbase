"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type AuthErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Shared body for the `(auth)` route error boundaries. Shows a safe, generic
 * message (`docs/errors-and-validation.md` §4) and a retry; the real error is
 * logged server-side by the framework and to the console here.
 */
export function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    console.error("Auth route error:", error);
  }, [error]);

  return (
    <div className="text-center">
      <h1 className="font-display text-xl font-black tracking-[-0.02em] text-lb-ink">
        Something went wrong
      </h1>
      <p className="mb-6 mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Please try again in a moment.
      </p>
      <Button variant="primary" size="lg" fullWidth onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
