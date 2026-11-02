import { z } from "zod";

/**
 * Username ("handle") validation, validated at the Server Action boundary
 * (`docs/errors-and-validation.md` §1) and reused by the onboarding client.
 *
 * Per the feature spec: 3–30 chars, lowercase letters, digits, hyphen and
 * underscore only. Input is trimmed + lowercased before the checks run, so
 * `" Foo "` normalizes to `foo`.
 */
export const HANDLE_MIN = 3;
export const HANDLE_MAX = 30;

/** Hoisted once (not per-call); matches the allowed charset. */
export const HANDLE_PATTERN = /^[a-z0-9_-]+$/;

/**
 * Handles that collide with real/likely routes or are otherwise unsafe to hand
 * to a user as a public profile slug. Compared against the normalized value.
 */
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  "admin",
  "api",
  "about",
  "account",
  "auth",
  "dashboard",
  "help",
  "home",
  "linkbase",
  "login",
  "logout",
  "onboarding",
  "privacy",
  "settings",
  "signin",
  "signup",
  "support",
  "terms",
  "user",
  "users",
  "www",
]);

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(HANDLE_MIN, `Username must be at least ${HANDLE_MIN} characters`)
  .max(HANDLE_MAX, `Username must be at most ${HANDLE_MAX} characters`)
  .regex(
    HANDLE_PATTERN,
    "Use only lowercase letters, numbers, hyphens and underscores",
  )
  .refine((value) => !RESERVED_HANDLES.has(value), {
    message: "That username isn't available",
  });

export type HandleInput = z.infer<typeof handleSchema>;
