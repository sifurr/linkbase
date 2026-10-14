# Linkbase — Data Fetching

How Linkbase reads data: Server Components call the database directly, every query is scoped to a caller the server trusts, and caching is applied per surface so the public page stays fast without ever putting one user's data in front of another.

Query helpers themselves — connection, models, the `userId` scoping rule — are in `database.md`. This doc covers where reads happen, what receives the result, and when the result may be cached.

**Current state:** `src/lib/db/` does not exist yet and Mongoose is not installed (`database.md`). Nothing in the app is cached yet. The paths and helpers below are the target layout — create them with the first real query.

---

## Reads happen in Server Components

**A Server Component calls the query helper directly.** No internal API route, no `fetch("/api/...")`, no client-side data layer.

```tsx
// src/app/(dashboard)/links/page.tsx
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getLinksForUser } from "@/lib/db/links";
import { LinkList } from "@/components/links/link-list";

export default function LinksPage() {
  return (
    <Suspense fallback={<LinksSkeleton />}>
      <Links />
    </Suspense>
  );
}

async function Links() {
  const user = await requireUser(); // identity from the session
  const links = await getLinksForUser(user.id); // ← direct DB call

  return <LinkList links={links} />;
}
```

`requireUser()` calls the session read — a runtime API — so `<Links>` sits behind a `<Suspense>` boundary rather than blocking the static shell (`auth.md`, and `08-caching.md` in the bundled Next docs). Push the `await` as deep in the tree as it goes: the deeper it sits, the more of the page prerenders.

### Why there is no internal API route

A `route.ts` is a **raw public HTTP endpoint** — it is outside `src/proxy.ts`'s matcher and outside the `(dashboard)` layout guard, so it receives no session check unless you write one by hand (`routing.md`). Fetching your own route from a Server Component therefore:

- adds a network hop and a second serialization pass to reach data that was already local;
- replaces a typed function call with an untyped response you must re-validate;
- bypasses the query-layer `userId` filter, putting the access check somewhere easy to forget.

Route Handlers stay reserved for webhooks and third-party callbacks. Everything a component reads goes through a helper in `src/lib/db/`.

**`fetch()` is for third-party APIs only.** If one is added, tag it at the call site so `revalidateTag` can clear it (`next: { tags: [...] }`) — but never point it at your own app.

---

## What every query is scoped to

There are exactly two scopes. Which one applies is decided by the route, never by the request body or the URL query string.

| Surface | Scope | Identity from | Where |
|---------|-------|---------------|-------|
| Dashboard and all `(dashboard)` routes | `userId` | **the session** (`requireUser()`) | `src/lib/db/` helpers |
| Public profile `/user/[handle]` | `handle` | **the URL segment** | `src/lib/db/profiles.ts` |

### Private data — scoped to the session `userId`

Every private query filters by the signed-in user's id, and that id comes from the session and nowhere else. A client-supplied `userId` — from form data, `searchParams`, or route params — turns the filter into a forgery. The full rule and its rationale are in `database.md`; it is enforced in the helper so no call site can forget:

```ts
// src/lib/db/links.ts
import { connectToDatabase } from "./connect";
import { LinkModel } from "./models/link";

// Takes the id from the session — never accept a client-supplied userId.
export async function getLinksForUser(userId: string) {
  await connectToDatabase();
  return LinkModel.find({ userId }).sort({ createdAt: -1 }).lean();
}
```

### Public data — scoped to the `handle`

`/user/[handle]` is the one place an unauthenticated request reaches the database, so it needs its own helper rather than a relaxed version of the private one (`auth.md`).

**Look the user up by `handle`, never accept a `userId` from the URL.** Then **project the public fields explicitly** — the projection is the access control on this route, because there is no session to scope by:

```ts
// src/lib/db/profiles.ts
import { connectToDatabase } from "./connect";
import { UserModel } from "./models/user";
import { LinkModel } from "./models/link";

const PUBLIC_USER_FIELDS = "handle name bio avatarUrl socials";

export async function getPublicProfile(handle: string) {
  await connectToDatabase();

  const user = await UserModel.findOne({ handle })
    .select(PUBLIC_USER_FIELDS)
    .lean();
  if (!user) return null;

  const links = await LinkModel.find({ userId: user._id, published: true })
    .select("title url thumb")
    .sort({ createdAt: -1 })
    .lean();

  return { user, links };
}
```

Never return the Mongoose document and rely on the view to hide fields. `email`, session data, unpublished links, and click counts are one accidental spread away from leaking.

---

## The client boundary

**A Client Component never queries the database.** It receives data as props from the Server Component that fetched it.

```tsx
// src/components/links/link-list.tsx
"use client";

import { useState } from "react";
import type { Link } from "@/lib/db/models/link";

type LinkListProps = { links: Link[] };

export function LinkList({ links }: LinkListProps) {
  const [query, setQuery] = useState("");
  const visible = links.filter((l) => l.title.includes(query));
  // ...
}
```

Two things follow, and both are enforced elsewhere:

- **`src/lib/db/` is server-only.** `src/lib/auth/` is marked `import "server-only"` (`auth.md`); the query helpers need the same treatment, so a `"use client"` file that imports one fails at build time instead of bundling the driver into the browser.
- **Props crossing the boundary must be serializable.** Cached and streamed values alike are serialized into the RSC payload, so use `.lean()` on every read that feeds a component. A live Mongoose document carries methods and internal state that will not survive the trip — and when a cached function returns one, it fails at the cache write rather than in the component, which is a harder error to read.

Mark the leaf component that needs interactivity, not the page around it (`architecture.md`). A page stays a Server Component and renders a small Client Component inside; the fetch stays above the boundary, the props flow down.

---

## Caching

`next.config.ts` enables `cacheComponents: true`, so the caching model is the `"use cache"` directive with `cacheLife` (how long) and `cacheTag` (what to invalidate by).

> **`unstable_cache` is not the API here.** It is replaced by `"use cache"` in Next.js 16, and the `next/cache` reference says so directly. There is also no Next.js **fetch cache** to reason about in this app's read path: reads hit MongoDB through Mongoose, not `fetch`. Reach for `"use cache"` on the query helper instead.

The rule that governs everything below: **a cached function's arguments are its cache key.** Different arguments produce different entries, which is what makes per-user caching safe when the id is passed in — and catastrophic when it is read from inside.

### What to cache

| Data | Cache it? | How |
|------|-----------|-----|
| Public profile (`/user/[handle]`) | **Yes** — identical for every visitor | `"use cache"` + `cacheLife` + `cacheTag` |
| The user's own links, in the dashboard | **Not by default** | per-request only, via `React.cache` (`getLinksForUser`) |
| Anything read from `cookies()` / `headers()` inside a cache scope | **Never** in the shared cache | `"use cache: private"`, or extract the value and pass it in |

**The public profile is the case caching is for.** It is keyed by `handle`, has no session, and is the same document for every visitor — so one entry serves everyone:

```ts
// src/lib/db/profiles.ts
import { cacheLife, cacheTag } from "next/cache";

export async function getPublicProfile(handle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`profile:${handle}`);

  // ...the same connection, projection, and .lean() reads as above
}
```

Tag it **per handle** rather than `profiles`, so editing one user's page does not invalidate every profile in the cache.

**Do not cache the dashboard reads by default.** They are gated behind the session, so they cannot join the prerendered shell; they fall back to a per-instance in-memory store that does not persist across serverless requests, meaning the entry often misses anyway. Use `React.cache` to dedupe within a single request and leave the cross-request cache to the public page:

```ts
// src/lib/db/links.ts
import { cache } from "react";

export const getLinksForUser = cache(async (userId: string) => {
  await connectToDatabase();
  return LinkModel.find({ userId }).sort({ createdAt: -1 }).lean();
});
```

`React.cache` is scoped to one request — it collapses repeated calls from different Server Components into one query, and shares nothing between users or requests. It is memoization, not caching, and it is safe for session-derived data precisely because of that.

### If per-user data is ever cached

The shape `auth.md` permits is: **the `userId` is an explicit argument** of a plain `"use cache"` function, so it lands in the cache key.

```ts
export async function getLinksForUser(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`links:${userId}`);

  await connectToDatabase();
  return LinkModel.find({ userId }).sort({ createdAt: -1 }).lean();
}
```

Two ways this goes wrong, both of which leak:

- **Reading `cookies()` inside the scope.** A regular `"use cache"` function cannot read request data — it is unsupported, not merely discouraged. Do not work around it by importing the session helper into the cached function; that is how one user's result gets stored under a key another user can hit.
- **Dropping the argument.** If a call site reaches a cached function without the id, every user shares one entry. Keep the id in the signature and never derive it inside.

The alternative that avoids the question entirely is **`"use cache: private"`**, which may read `cookies()` and `headers()` directly and whose result is stored **in the browser only**, never in a shared server cache.

---

## Revalidating after a mutation

A mutation writes to MongoDB, then clears the tags that read depended on. Do it in the Server Action that performed the write, after it succeeds.

| API | Where | Behavior | Use for |
|-----|-------|----------|---------|
| `updateTag(tag)` | Server Actions only | Expires immediately | Read-your-own-writes — the user sees their change now |
| `revalidateTag(tag, "max")` | Server Actions + Route Handlers | Stale-while-revalidate | Background refresh — a slight delay is fine |
| `revalidatePath(path)` | Server Actions + Route Handlers | Invalidates a route path | Last resort; over-invalidates |

```ts
// src/app/(dashboard)/links/actions.ts
"use server";

import { revalidateTag, updateTag } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function createLink(formData: FormData) {
  const user = await requireUser(); // layer 3 — every action re-checks identity

  // ...validate, then write scoped by user.id (layer 4)

  updateTag(`links:${user.id}`); // the author is looking at this list
  revalidateTag(`profile:${user.handle}`, "max"); // visitors can catch up
}
```

**`revalidateTag` takes two arguments.** The single-argument form `revalidateTag(tag)` is deprecated and behaves like `{ expire: 0 }` — pass a profile (`"max"` is the recommended one) or an object with `expire`. Calling it from a Client Component throws; it is server-only.

Tag naming — keep one convention so the invalidation call site is obvious from the read:

| Tag | Set by | Cleared when |
|-----|--------|--------------|
| `profile:<handle>` | the public profile read | that user edits their profile, or adds/removes a link |
| `links:<userId>` | the dashboard links read, if it is ever cached | that user mutates a link |

Revalidate **narrowly**. A bare `profiles` tag would drop every user's cached page on every edit, and the whole point of keying by handle is that one page's staleness is one page's problem.

> **Good to know:** the mutation writes to the database and clears the tag, and the *next request* re-runs the read — `revalidateTag` marks; it does not repopulate. Nothing here needs to run inside the cache scope; in fact a cached function cannot call `revalidateTag` or `updateTag` at all.

---

## TBD

- Whether the dashboard reads are cached at all. The default above is no; revisit if profiling shows the per-request query cost matters.
- Tag vocabulary beyond `profile:<handle>` and `links:<userId>` — settle the full list when more surfaces land, so tags stay consistent.
- `cacheLife` values per surface. `hours` on the public profile is a starting point, not a decision.
- Whether click counts read from the cached profile or from a live query. They change on every visitor tap, so they may need to stay outside the cache.
- Rate limiting and bot handling on `/user/[handle]`, which caching partly mitigates but does not replace (`auth.md`).
- Whether a durable cache handler (`"use cache: remote"`) is worth configuring for the public profile, or whether per-instance in-memory caching is enough.
