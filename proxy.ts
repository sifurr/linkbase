import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import {
  ONBOARDING_PATH,
  POST_ONBOARDING_REDIRECT,
  PROTECTED_PREFIXES,
} from "@/lib/auth/routes";

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
  const { pathname, origin } = req.nextUrl;
  const user = req.auth?.user;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const onOnboarding =
    pathname === ONBOARDING_PATH || pathname.startsWith(`${ONBOARDING_PATH}/`);

  // Unauthenticated on a protected path → sign in, preserving the return URL.
  if (isProtected && !user) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(loginUrl);
  }

  // Handle gate. Authenticated with no handle → force onboarding on any other
  // protected route; already has a handle → onboarding is done, go home.
  if (user && !user.handle && isProtected && !onOnboarding) {
    return Response.redirect(new URL(ONBOARDING_PATH, origin));
  }
  if (user?.handle && onOnboarding) {
    return Response.redirect(new URL(POST_ONBOARDING_REDIRECT, origin));
  }
});

export const config = {
  matcher: ["/onboarding/:path*", "/dashboard/:path*"],
};
