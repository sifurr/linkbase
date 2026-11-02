/**
 * Typed results for the onboarding (select-handle) flow
 * (`docs/data-mutations.md` §3). Kept out of the `"use server"` action module
 * because those may only export async functions.
 */
export type HandleFieldErrors = {
  handle?: string[];
};

export type HandleFormState = {
  error?: string;
  fieldErrors?: HandleFieldErrors;
};

/**
 * Live availability states. `idle`/`checking` are client-only; the server
 * action returns the remaining ones.
 */
export type HandleAvailability =
  | "idle"
  | "checking"
  | "too-short"
  | "invalid"
  | "reserved"
  | "taken"
  | "available";

export type HandleCheckResult = { status: HandleAvailability };
