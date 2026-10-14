# Linkbase — Routing

How routes are organised: what is public, what sits behind the `(dashboard)` group, the per-route files each segment owns, and when a Route Handler is allowed.

The protection model itself — `requireUser()`, `src/proxy.ts`, the four enforcement layers — is in `auth.md`. This doc is about the route tree.

**Current state:** `src/app/` holds only the scaffold `layout.tsx`, `page.tsx`, and `globals.css`. No groups exist yet.

---

## Route map

| URL | File | Access |
|-----|------|--------|
| `/` | `src/app/page.tsx` | **Public** — landing page |
| `/user/[handle]` | `src/app/user/[handle]/page.tsx` | **Public** — the profile page |
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | **Authenticated** |
| `/add-links` | `src/app/(dashboard)/add-links/page.tsx` | **Authenticated** |
| `/login`, `/signup` | `src/app/(auth)/login/page.tsx`, `…/signup/page.tsx` | Public; redirect signed-in users to `/dashboard` |
| `/api/<provider>` | `src/app/api/<provider>/route.ts` | **Webhooks and third-party callbacks only** |

Kebab-case for all segments and files, per `coding-standards.md`.

---

## Route groups

Two groups, each with its own `layout.tsx`:

- **`(dashboard)`** — every authenticated screen. `requireUser()` in the group's layout makes new routes protected **by default** (`auth.md`).
- **`(auth)`** — sign-in and sign-up, sharing a centred card layout with no app chrome.

Group names in parentheses **do not appear in the URL** — `(dashboard)` is source-tree grouping only. Three consequences:

> **The trap: the dashboard's own index cannot be `(dashboard)/page.tsx`.** Route groups don't affect the URL, so `src/app/(dashboard)/page.tsx` resolves to **`/`** and collides with the landing page at `src/app/page.tsx`. Next errors on this: *"Routes in different groups should not resolve to the same URL path."* The dashboard needs a real URL segment — hence `(dashboard)/dashboard/page.tsx` → `/dashboard` above. Same applies to `(auth)`: `(auth)/login/page.tsx` → `/login` is correct, `(auth)/page.tsx` would collide.

- **Never let two groups claim the same URL.** `(dashboard)/settings/page.tsx` and `(auth)/settings/page.tsx` would both resolve to `/settings` and fail the build. Distinct screens need distinct segments.
- **Avoid multiple *root* layouts.** If `(dashboard)` and `(auth)` each define a top-level layout with `<html>`, navigating between them triggers a full page reload. Keep the single root `src/app/layout.tsx` and let each group's layout be a nested one.

---

## Per-route files

Each segment owns the files it needs — **"where needed" is literal.** An empty `loading.tsx` that flashes for 40ms is worse than none; add these where the segment genuinely benefits.

| File | What it does | Gotchas |
|------|--------------|---------|
| `layout.tsx` | Shared chrome for the segment and its children | Persists across navigation and does **not** re-render between sibling routes — so no per-navigation data fetching here. The group's auth guard belongs here. |
| `loading.tsx` | Instant loading UI | A **Server Component** by default. Next nests it inside `layout.tsx` and automatically wraps `page.tsx` and children in `<Suspense>` — you do not write the boundary yourself. |
| `error.tsx` | Recoverable error UI for the segment | **Must be a Client Component** — `"use client"` is required (error boundaries are client-only). Props are `{ error, retry }`. |
| `not-found.tsx` | 404 UI for the segment | Triggered by `notFound()` or an unmatched route in the segment. |

### Two `error.tsx` details that bite

**The recovery prop is `retry`, not `reset`.** Next 16 renamed it. Code written from memory will destructure `reset` and get `undefined`, so the "Try again" button silently does nothing:

```tsx
"use client"; // required — error boundaries must be Client Components

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => retry()}>Try again</button>
    </div>
  );
}
```

**An `error.tsx` does not catch errors from its own segment's `layout.tsx`.** It wraps `loading`, `not-found`, `page`, and *nested* layouts — but not the `layout.tsx` above it in the same folder. An error thrown there escapes to the parent segment's boundary; to handle the root layout, use `global-error.tsx`. Practical upshot: if the dashboard layout does the auth check and throws, the dashboard's own `error.tsx` will not catch it.

**Do not leak error detail.** In production, server-thrown errors reach the client as a generic message plus `error.digest` — use the digest to match server logs. Never render `error.message` to the user; log it server-side (`coding-standards.md`).

---

## Route Handlers

**`src/app/api/**/route.ts` is reserved for webhooks and third-party callbacks.** Everything else goes through a Server Action.

| Use a Route Handler | Use a Server Action |
|---------------------|---------------------|
| Stripe / provider webhooks | Any form submission |
| OAuth and third-party callbacks | Mutations from the dashboard |
| Endpoints an external service calls | Anything a React component invokes |

The reason is not stylistic. A Server Action is bound to the session and carries a typed argument; a Route Handler is a raw public HTTP endpoint you must secure by hand. Reaching for one for internal CRUD creates an endpoint that is easy to forget to guard.

Route Handlers use **named HTTP-method exports**, not a default (`coding-standards.md`):

```ts
// src/app/api/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text(); // raw body first — signatures are over raw bytes
  if (!verifySignature(body, req.headers.get("stripe-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }
  const event = JSON.parse(body);
  // ...
  return new Response(null, { status: 204 });
}
```

> **`/api` sits outside every protection layer.** The proxy matcher in `auth.md` excludes `api` from its pattern, and route handlers are not under the `(dashboard)` layout guard — so they receive **no session check at all**. That is correct for a webhook (the caller has no session), but it means the request is fully untrusted: verify the provider's signature against the **raw body** before parsing, and treat every field as attacker-controlled. Verify before `JSON.parse`, never after.

---

## TBD

- The real dashboard route tree — the segments above are indicative; confirm actual screens and nav structure.
- Whether `/` stays at `src/app/page.tsx` or moves into a `(marketing)` group as the site grows.
- `unauthorized.tsx` / `forbidden.tsx`: Next 16 can render a proper 401/403 UI via `unauthorized()`, but it requires `authInterrupts: true` in `next.config.ts`, **which is not currently enabled**. Worth turning on if a signed-in user can ever legitimately lack access to a resource — a redirect to sign-in is the wrong answer for an already-authenticated user.
- `template.tsx` (re-renders on navigation, unlike `layout.tsx`) if any segment needs per-navigation reset.
- `default.tsx` only if parallel routes are introduced.
