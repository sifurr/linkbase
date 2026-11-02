import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";

export { auth, signIn, signOut } from "@/auth";
// Server-side session patch (Auth.js v5). Used by the onboarding action to push
// the new handle onto the JWT via the `jwt` callback's `trigger: "update"`.
export { unstable_update as updateSession } from "@/auth";

/**
 * The Data Access Layer entry point: resolve the signed-in user from the
 * session (`docs/auth.md` §4). Returns `null` when there is no session.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Same, but redirects to sign-in when there is no session. Use in protected
 * Server Components and Actions that have nothing to render for a guest.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
