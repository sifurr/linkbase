import type { NextAuthConfig } from "next-auth";

import { PROTECTED_PREFIXES } from "@/lib/auth/routes";

/**
 * Edge-safe Auth.js config: `pages`, the `authorized` callback, and an empty
 * `providers` list. This is the slice the middleware runs, so it must not pull
 * in Mongoose, bcrypt, or any Node-only code — those live in `auth.ts`, which
 * spreads this config and adds the Credentials provider.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isProtected = PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );

      if (isProtected) {
        return Boolean(auth?.user);
      }

      return true;
    },
    // Edge-safe (token-only, no DB): shapes the session so BOTH the edge proxy
    // (`req.auth.user.handle`) and Node Server Components read `id`/`handle`.
    // The Node instance (`auth.ts`) inherits this via `...authConfig.callbacks`.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.handle = token.handle;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
