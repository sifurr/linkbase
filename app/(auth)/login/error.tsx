"use client";

import { AuthError } from "@/components/auth/auth-error";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AuthError error={error} reset={reset} />;
}
