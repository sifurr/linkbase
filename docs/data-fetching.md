# Linkbase — Data Fetching

How Linkbase reads data: where reads run, how they're scoped, how they're cached, and how data reaches the client. Read this before adding a query or a data-loading component.

---

## 1. Reads run in Server Components

Reads happen in **Server Components** by calling the database **directly** — through the `lib/db` helpers and models.

- **No `fetch` to internal API routes** for reads. A Server Component already runs on the server; going out to an internal route just adds a network hop and a serialization round-trip.
- (Route Handlers stay reserved for webhooks and third-party callbacks — see [`routing.md`](routing.md) §5.)

## 2. Scope every query

- **Private data** is scoped to the **signed-in user's id** — the session-derived `userId`, never client input (see [`auth.md`](auth.md) §4 and [`database.md`](database.md) §5).
- **Public profile pages** are scoped to the **`handle`** from the route, returning only what a public profile is meant to expose.

## 3. Cache and tag

Cache reads with the **Next.js fetch cache** or **`unstable_cache`** where it helps.

- **Tag** cached reads so **`revalidateTag`** can clear them after a mutation — a Server Action that changes data revalidates the tags its reads depend on.
- Cache where it earns its keep; don't cache data that must always be fresh.

## 4. Client Components receive data as props

**Client Components never query the database directly.** They receive data as **props from a Server Component**, which does the fetching and passes the result down.
