# Linkbase — Routing

How Linkbase organizes routes under the App Router, which ones are public, and where logic belongs. Read this before adding a route, a route group, or an API handler.

---

## 1. Public routes

Open to everyone, no session required:

- **`/`** — the landing page.
- **`/user/[handle]`** — the public profile (see [`auth.md`](auth.md) §3).

## 2. Authenticated routes — the `(dashboard)` group

Everything a signed-in user works in lives under the **`(dashboard)`** route group:

- Covers the **dashboard**, **add-links**, and other protected screens.
- **Middleware** protects the whole group: an unauthenticated request is redirected to sign-in before the page renders (see [`auth.md`](auth.md) §2).

## 3. Auth routes — the `(auth)` group

Sign-in and the rest of the authentication screens sit under the **`(auth)`** route group, separate from the dashboard.

## 4. Per-route files

Each route owns its own **`layout.tsx`**, **`loading.tsx`**, and **`error.tsx`** where needed — scoped to that route rather than pushed up to a shared ancestor. Add them per route as the UX calls for them.

## 5. Route Handlers vs. Server Actions

- **Route Handlers in `app/api`** are reserved for **webhooks and third-party callbacks only** — inbound requests from outside the app that can't call a Server Action.
- **Everything else goes through Server Actions.** Data mutations and form handling from within the app are Server Actions, not API routes.
