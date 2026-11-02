import { z } from "zod";

/**
 * Shared auth schemas, validated at the Server Action boundary
 * (`docs/errors-and-validation.md` §1) and reused by the client forms.
 *
 * bcrypt only hashes the first 72 bytes of a password, so passwords are capped
 * at 72 characters to avoid silently truncating input.
 */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
