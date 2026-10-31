# Linkbase — Auth

How Linkbase handles sign-in, sessions, and access control. Read this before adding a route, a Server Action, or anything that reads the signed-in user.

---

## 1. NextAuth owns the hard parts

**NextAuth** handles sign-in, session management, and the surrounding security (CSRF, cookie handling, token rotation) following industry best practices. We don't hand-roll credentials, sessions, or crypto — NextAuth does it, and we read the result through the helpers in **`lib/auth`**.

## 2. Protected by default

Everything under **`app/(dashboard)/*`** is **protected** and requires an authenticated session.

- **Middleware** enforces this at the edge: an unauthenticated request to a dashboard route is redirected to sign-in before the page renders.
- New routes added under `app/(dashboard)/` inherit this protection automatically — there is nothing to opt into.

## 3. The one public route

The public profile at **`/user/[handle]`** stays **open to everyone** — no session required. It renders only the data a profile is meant to expose; it never leaks anything scoped to the signed-in user.

## 4. Identity is enforced on the server

A user can only ever read and write **their own** links. This is enforced in two places, never on the client:

- **In every Server Action** — the user's identity comes from the authenticated session (via `lib/auth`), never from client input. An action derives `userId` from the session and uses it as the actor.
- **At the database level** — every query is scoped by an ownership check on **`userId`** (see [`database.md`](database.md) §5). There is no unscoped query, so a forged id in a request body can't reach another user's data.

The client is never trusted to say who it is.
