import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in — Linkbase",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-black tracking-[-0.02em] text-lb-ink">
        Welcome back
      </h1>
      <p className="mb-6 mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Log in to your Linkbase.
      </p>
      <LoginForm />
    </div>
  );
}
