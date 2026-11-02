"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logIn } from "@/lib/auth/actions";
import type { AuthFormState } from "@/lib/auth/types";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(logIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl px-4 py-3 text-sm font-semibold"
          style={{
            background: "var(--lb-gray-100)",
            color: "var(--lb-berry)",
          }}
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-lb-ink">Email</span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Email"
          size="lg"
          required
        />
        {state.fieldErrors?.email ? (
          <p className="text-xs font-medium" style={{ color: "var(--lb-berry)" }}>
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-lb-ink">Password</span>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-label="Password"
          size="lg"
          required
        />
        {state.fieldErrors?.password ? (
          <p className="text-xs font-medium" style={{ color: "var(--lb-berry)" }}>
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={pending}
      >
        {pending ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
        New to Linkbase?{" "}
        <Link href="/signup" className="font-semibold text-lb-ink underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
