/**
 * The typed result an auth action returns to its form
 * (`docs/data-mutations.md` §3). `fieldErrors` maps inline next to inputs;
 * `error` is a form-level message. Kept out of the `"use server"` action module
 * because those may only export async functions.
 */
export type AuthFieldErrors = {
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
};

export type AuthFormState = {
  error?: string;
  fieldErrors?: AuthFieldErrors;
};
