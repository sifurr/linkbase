import { z } from "zod";

/**
 * Link validation, applied at the Server Action boundary
 * (`docs/errors-and-validation.md` §1) and reused by the dashboard forms.
 */
export const TITLE_MIN = 1;
export const TITLE_MAX = 100;

const title = z
  .string()
  .trim()
  .min(TITLE_MIN, "Title is required")
  .max(TITLE_MAX, `Title must be at most ${TITLE_MAX} characters`);

// Zod 4: `z.httpUrl()` restricts the protocol to http/https and requires a valid
// domain hostname (replaces the deprecated `z.string().url()`).
const url = z
  .string()
  .trim()
  .pipe(z.httpUrl({ error: "Enter a valid URL starting with http:// or https://" }));

export const linkSchema = z.object({ title, url });

/** A Mongo ObjectId as a 24-char hex string (for update/delete targeting). */
export const linkIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/, "Invalid link id");

export type LinkInput = z.infer<typeof linkSchema>;
