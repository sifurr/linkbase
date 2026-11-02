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
  },
} satisfies NextAuthConfig;
