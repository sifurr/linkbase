"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import { POST_AUTH_REDIRECT } from "@/lib/auth/routes";
import { rateLimit } from "@/lib/auth/rate-limit";
import type { AuthFormState } from "@/lib/auth/types";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/db/models/user";
import { loginSchema, signupSchema } from "@/lib/validation/auth";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const BCRYPT_COST = 12;

const TOO_MANY_ATTEMPTS =
  "Too many attempts. Please wait a minute and try again.";

async function clientKey(scope: string): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

/**
 * Log in with email + password. Validates, then hands off to NextAuth's
 * Credentials flow. On success `signIn` redirects (which throws `NEXT_REDIRECT`
 * — rethrown here); on bad credentials it throws `AuthError`, returned as a
 * generic message so we never reveal which field was wrong.
 */
export async function logIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const limit = rateLimit(
    await clientKey("login"),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    return { error: TOO_MANY_ATTEMPTS };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: POST_AUTH_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // Includes the NEXT_REDIRECT control-flow throw — let it propagate.
    throw error;
  }

  return {};
}

/**
 * Create an account, then sign the new user in. Signup is the one write that
 * precedes a session, so there is no session check (`docs/data-mutations.md`
 * §2). Expected failures (invalid input, duplicate email) are returned inline;
 * only genuinely unexpected errors throw to the nearest `error.tsx`.
 */
export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const limit = rateLimit(
    await clientKey("signup"),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    return { error: TOO_MANY_ATTEMPTS };
  }

  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { fieldErrors };
  }

  const confirmPassword = formData.get("confirmPassword");
  if (confirmPassword !== parsed.data.password) {
    return { fieldErrors: { confirmPassword: ["Passwords do not match"] } };
  }

  const { email, password } = parsed.data;

  await dbConnect();
  const existing = await User.exists({ email });
  if (existing) {
    return { fieldErrors: { email: ["That email is already registered"] } };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  await User.create({ email, passwordHash });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: POST_AUTH_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // The account exists; just send them to log in manually.
      return {
        error: "Account created, but sign-in failed. Please log in.",
      };
    }
    throw error;
  }

  return {};
}

/**
 * End the session and return to the landing page.
 */
export async function logOut(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
