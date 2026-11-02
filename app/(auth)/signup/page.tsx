import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up — Linkbase",
};

export default function SignupPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-black tracking-[-0.02em] text-lb-ink">
        Create your Linkbase
      </h1>
      <p className="mb-6 mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Everything you are, in one simple link.
      </p>
      <SignupForm />
    </div>
  );
}
