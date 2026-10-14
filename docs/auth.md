# Linkbase — Authentication & Authorization

How Linkbase authenticates users and, more importantly, how it keeps them out of each other's data.

**NextAuth handles sign-in, sessions, and session security.** Authorization — who may read or write which document — is Linkbase's own responsibility and lives close to the data, not in the session layer.

**Current state:** NextAuth is not installed. Use the **Auth.js / NextAuth v5** line: v4 is Pages-Router oriented and does not provide the `auth()` helper that reads the session in Server Components and Server Actions. Pin the exact version when installing — it is not yet in `package.json`. The paths below follow `architecture.md`; `src/lib/auth/` is the only place the auth library is imported.

---

## Session

- Auth helpers live in `src/lib/auth/`, split from the NextAuth route handler config.
- Export one **`requireUser()`** that returns the session user or redirects to sign-in, and one **`getUser()`** for optional reads. Every protected page, layout, Server Action, and query helper uses one of these.
- Mark the module `import "server-only"` so a Client Component import fails at build time instead of shipping session logic to the browser.
- Sign-in/out and the NextAuth handler are the only routes that skip the user check.

Critically, **the session is the source of `userId`**. It is the one value the rest of the system trusts. See `database.md` — query scoping assumes `userId` came from here, never from a form field, search param, or route param.

---

## Route protection

| Surface | Path | Access |
|---------|------|--------|
| Dashboard (all app screens) | `src/app/(dashboard)/**` | **Authenticated by default** — sign-in required |
| Public profile | `src/app/user/[handle]/` | **Open to everyone** — no session |
| Auth screens | `/login`, `/signup` | Public; redirect signed-in users to the dashboard |
| Marketing | `/`, and the sections in `ui.md` | Public |

"Protected by default" means a **new route added under the group is protected without anyone remembering to protect it.** That property comes from the group's layout, not from a path list:

```tsx
// src/app/(dashboard)/layout.tsx
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  await requireUser(); // every route in this group inherits the check
  return <>{children}</>;
}
```

### Two things about the group name

1. **`(dashboard)` is not part of the URL.** Route groups are stripped from the path, so `src/app/(dashboard)/links/page.tsx` serves **`/links`**. Nothing can match `(dashboard)` against a URL — the parentheses are a source-tree grouping only. This is why the layout above, not a path pattern, is what makes the group protected by default.
2. **`/user/[handle]` is deliberately outside the group.** Keep it there. A route inside `(dashboard)` inherits the sign-in requirement and would break the public profile.

### Enforcement: `src/proxy.ts`, not `middleware.ts`

**Next 16 renamed `middleware` to `proxy`** — both the filename and the API (`skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`). Create **`src/proxy.ts`**: it must sit at the same level as `src/app/`. A `middleware.ts` file is deprecated and will not run as expected.

```ts
// src/proxy.ts — optimistic redirect only; see the warning below
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const PROTECTED = [/^\/links/, /^\/settings/]; // real URL paths — no "(dashboard)"
const AUTH_ROUTES = ["/login", "/signup"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = (await cookies()).get("session")?.value; // cookie read only

  if (PROTECTED.some((re) => re.test(pathname)) && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (AUTH_ROUTES.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/links", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

> **Verify against NextAuth's docs when installing.** NextAuth v5 documents its middleware helper as `middleware`, and it is not yet clear that it emits the Next 16 `proxy` name. If the exported name is wrong the file is silently ignored — the app runs, routes are just unprotected. Test the redirect before trusting it.

---

## Proxy is an optimistic gate, not the lock

Official guidance is explicit that **Proxy should not be your only line of defense**; the majority of security checks belong as close to the data as possible. So:

- **Proxy reads the cookie only — never the database.** It runs on every route including prefetches, so a DB round-trip there is both slow and abusable.
- Therefore proxy answers "is *some* session present?" — it cannot know the session is valid, unexpired, or that the user owns the resource. It is a redirect convenience that keeps signed-out users from seeing a broken shell.
- **The authoritative checks are server-side, per resource:** the dashboard layout guard, then `requireUser()` in every Server Action, then the `userId` filter in every query.

Treat proxy as UX. Treat the layers below as security.

---

## Enforcement layers

Four layers, each of which fails closed on its own:

| # | Layer | Checks | Where |
|---|-------|--------|-------|
| 1 | Proxy | A session cookie exists | `src/proxy.ts` |
| 2 | Layout guard | Session is valid; else redirect | `src/app/(dashboard)/layout.tsx` |
| 3 | Server Action | `requireUser()` at the top of **every** action | `actions.ts` files |
| 4 | Query | Filter scoped to the session `userId` | `src/lib/db/` — see `database.md` |

Layers 3 and 4 are the ones you must not skip. A Server Action is a public HTTP endpoint — the fact that only your UI renders the button that calls it means nothing. Every action re-establishes identity server-side:

```ts
"use server";

import { requireUser } from "@/lib/auth";

export async function updateLink(formData: FormData) {
  const user = await requireUser(); // layer 3: identity from the session

  const id = String(formData.get("id"));
  // layer 4: scope the filter by userId, not just _id —
  // otherwise any signed-in user can edit any link by guessing an id.
  await updateLinkForUser(user.id, id, { title: String(formData.get("title")) });
}
```

**Users can only read and write their own links.** That is enforced by layer 4 scoping by `userId`, and it is the reason `database.md` forbids accepting a `userId` from client input — a caller who supplies someone else's id defeats the check entirely.

---

## Cache Components

`next.config.ts` enables `cacheComponents: true`, which changes how session reads behave. Get this wrong and one user's data can be served to another, so it is a security concern, not just a performance one.

- **A session read is request-time, so it cannot be prerendered into the static shell.** Authenticated UI streams in behind a `<Suspense>` boundary on every navigation, rather than blocking the page.
- **Never cache per-user authenticated data in a shared server cache.** Only two safe shapes exist:
  - `"use cache: private"` — reads `cookies()`/`headers()` directly, and the result stays **in the browser only**, never on the server.
  - Extract the value first (`userId`) and pass it into a plain `"use cache"` / `"use cache: remote"`.
- **The public profile is the safe caching case** — keyed by `handle`, identical for every visitor, no session involved. Cache it freely; that is the whole point of it being public.
- If instant-navigation validation flags a route for reading the session, `export const instant = false` on that page or layout keeps it blocking while you adopt the streaming pattern.

Read `01-app/02-guides/authentication-with-cache-components.md` in the bundled Next docs before caching anything session-derived.

---

## Public surface

`/user/[handle]` is open, so it is the one place unauthenticated input reaches the database:

- **Look the user up by `handle`, never accept a `userId` from the URL.** The handle identifies whose page it is; nothing else on that route should be client-controlled.
- **Return only published, public fields — project them explicitly.** Never let a Mongoose document reach the page and rely on the view to hide fields: `email`, session data, unpublished links, and click counts are all one accidental spread away from leaking. Use a projection or a DTO.
- **Read-only, no session.** The visitor is not signed in, so per-user scoping does not apply here — the projection *is* the access control. This is the exception `database.md` flags for ownership helpers.

---

## TBD

- NextAuth session strategy: JWT vs database sessions, and whether a MongoDB adapter is used (which would add its own collections alongside the models in `database.md`).
- Which sign-in providers (email magic link, OAuth, credentials) — password handling rules if credentials are used.
- Session lifetime, renewal, and sign-out invalidation.
- Password reset and email verification flows.
- Rate limiting on sign-in and the public profile route.
- An `unauthorized()` / forbidden path distinct from "not signed in" if a signed-in user ever legitimately lacks access to a resource.
