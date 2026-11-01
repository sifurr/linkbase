# Linkbase — Data Mutations

How Linkbase writes data: every write is a Server Action that follows the same ordered steps. Read this before writing an action that creates, updates, or deletes anything.

---

## 1. Writes are Server Actions

**All writes go through Server Actions**, never API routes. (Route Handlers in `app/api` stay reserved for webhooks and third-party callbacks — see [`routing.md`](routing.md) §5.)

## 2. The order every action follows

Each action runs these steps, in this order:

1. **Check the session first** — resolve the signed-in user via `lib/auth`; no session, no write (see [`auth.md`](auth.md) §4).
2. **Validate input** with the matching **Zod schema** from `lib/validation` (see [`errors-and-validation.md`](errors-and-validation.md) §1).
3. **Scope the query** to the signed-in user's **`userId`** — derived from the session, never from client input (see [`database.md`](database.md) §5).
4. **Perform the write.**
5. **Revalidate** — call **`revalidatePath`** or **`revalidateTag`** to refresh the affected views, clearing the cache tags those reads depend on (see [`data-fetching.md`](data-fetching.md) §3).

## 3. Return a typed result, don't throw for expected failures

- An action returns a **typed result**: either the **data** on success or a **validation error** the form can render inline next to fields.
- Expected failures (bad input) are **returned, not thrown**. Only unexpected errors throw, to be caught by the nearest `error.tsx` (see [`errors-and-validation.md`](errors-and-validation.md) §§2–3).
