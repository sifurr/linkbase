/**
 * Typed results for the link mutations (`docs/data-mutations.md` §3) and the
 * serialized shape handed to Client Components. Kept out of the `"use server"`
 * action module, which may only export async functions.
 */
export type LinkFieldErrors = {
  title?: string[];
  url?: string[];
};

export type LinkFormState = {
  error?: string;
  fieldErrors?: LinkFieldErrors;
  /** Set on a successful mutation so the client can close the dialog / exit edit mode. */
  ok?: boolean;
};

/** Plain, serializable link for passing from Server to Client Components. */
export type LinkView = {
  id: string;
  title: string;
  url: string;
};

/**
 * The public profile at `/user/[handle]`, scoped to the route handle and
 * exposing only what a profile is meant to show — never anything session-scoped
 * (`docs/auth.md` §3, `docs/data-fetching.md` §2).
 */
export type PublicProfile = {
  handle: string;
  /** Optional display name; the page falls back to the handle when absent. */
  name?: string;
  links: LinkView[];
};
