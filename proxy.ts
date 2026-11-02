import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import { PROTECTED_PREFIXES } from "@/lib/auth/routes";

/**
 * Next.js 16 Proxy (formerly `middleware.ts`). As of Next.js 16 the file is
 * named `proxy.ts` and must export a function as `proxy` (or default) — a
 * destructured `export const { auth: proxy }` is not statically recognized as
 * a function by the production build, so we wrap `auth` in a `proxy` function
 * per the Auth.js v5 Next.js 16 guidance.
 *
 * Edge-safe instance (no DB/bcrypt). In the wrapped form the handler owns the
 * gating (the `authorized` callback is only auto-applied to the bare `auth`
 * export), so we redirect unauthenticated requests to protected paths here,
 * preserving the `?callbackUrl=` the login page reads. The matcher keeps this
 * off public routes — notably `/` — so their static shells aren't forced
 * dynamic.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !req.auth?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/select-handle/:path*"],
};
