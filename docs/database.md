# Linkbase — Database

Linkbase stores data in **MongoDB**, accessed through **Mongoose**. Read this before writing a model, a query, or anything that touches the connection.

---

## 1. Why Mongoose

Mongoose owns three things so the rest of the app doesn't have to:

- **Schema & validation** — every collection is defined by a Mongoose schema; validation runs on write, not in route handlers.
- **Connection pooling** — the driver's pool is managed by Mongoose; we never open raw connections.

## 2. Connection — single cached connection

There is **one** connection, created lazily and cached, then reused across every Server Action in both development and production. This avoids exhausting the pool when the module graph is re-evaluated (hot reload in dev, serverless invocations in prod).

- The connection helper lives in **`lib/db`**.
- It caches the connection promise on a module-level global and returns the existing one if present; it only dials MongoDB on the first call.
- Every Server Action that needs the database `await`s the helper before running a query.

## 3. Models

- Models live in **`lib/db/models`**, one file per model (`kebab-case`, e.g. `link.ts`, `profile.ts`).
- Each model is registered once and reused from the cache on subsequent imports (never redefine a model that already exists on the connection).

## 4. Schema conventions

Every schema sets:

- **`strict` mode** — fields not in the schema are rejected, never silently stored.
- **`timestamps`** — `createdAt` / `updatedAt` are maintained automatically.
- **Indexes** on **`userId`** and **`handle`** — matching the access pattern below.

## 5. Every query is scoped to the signed-in user

This is the rule that keeps tenants isolated: **a user can only ever touch their own data.**

- Every document carries a **`userId`** (the signed-in user's id).
- Every query — read, update, delete — includes `userId` in its filter. There is no unscoped query.
- The `userId` comes from the authenticated session (see `lib/auth`), never from client input.
