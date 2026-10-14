# Linkbase — Database (MongoDB + Mongoose)

How Linkbase talks to MongoDB: the cached connection, where models live, the schema options every model carries, and the ownership rule that every query must obey.

Mongoose owns schema definition, validation, and connection pooling. Do not bypass it with the raw driver.

**Current state:** Mongoose is not installed yet — `package.json` has no `mongoose` or `mongodb` dependency. Run `npm install mongoose` and set `MONGODB_URI` before the first model. The paths below are the target layout from `architecture.md`.

---

## Connection

A **single cached connection**, reused across Server Actions, in both development and production.

- Connection helper: `src/lib/db/connect.ts` — the only file that calls `mongoose.connect`. Per `architecture.md`, `src/lib/db/` is the only place the driver is imported.
- URI comes from `MONGODB_URI` in `.env.local` (`.env*` is gitignored). Never hardcode it.
- Call `connectToDatabase()` at the top of every query helper. It is cheap after the first call — it returns the cached connection.

**Why the cache is mandatory here, not an optimization:**

- **Development** — HMR re-evaluates modules on every edit. Without a cache, each reload calls `mongoose.connect` again and you exhaust the connection pool within minutes.
- **Production** — Server Actions and route handlers run in short-lived, reused serverless instances. A connection created per invocation is never reused, which defeats pooling and stalls under cold starts.

The cache lives on `globalThis` so it survives module re-evaluation:

```ts
// src/lib/db/connect.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache | undefined;
}

// Reuse the cache across HMR reloads instead of reconnecting.
const cached: MongooseCache = (global.mongoose ??= { conn: null, promise: null });

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  // Cache the promise, not just the result: concurrent callers await one connect.
  cached.promise ??= mongoose.connect(MONGODB_URI, { bufferCommands: false });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // let the next caller retry a failed connect
    throw error;
  }

  return cached.conn;
}
```

Caching the **promise** rather than the resolved connection matters: several Server Actions can fire before the first connect settles, and they must all await the same in-flight connection rather than starting their own.

---

## Models

Models live in `src/lib/db/models/` — one file per model, `kebab-case` filename, `PascalCase` model name (`link.ts` → `Link`).

Reuse the existing model when one is already registered, or HMR throws `OverwriteModelError` on reload:

```ts
// src/lib/db/models/link.ts
import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const linkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    clicks: { type: Number, default: 0, min: 0 },
  },
  { strict: true, timestamps: true },
);

linkSchema.index({ userId: 1 });

export type Link = InferSchemaType<typeof linkSchema>;

export const LinkModel =
  (models.Link as Model<Link>) ?? model<Link>("Link", linkSchema);
```

Derive the TypeScript type with `InferSchemaType` — do not hand-write a parallel interface that can drift from the schema.

---

## Schema conventions

Every schema sets these options:

| Option | Value | Why |
|--------|-------|-----|
| `strict` | `true` | Drop fields not in the schema, so a stray key from client input is never persisted |
| `timestamps` | `true` | `createdAt` / `updatedAt` maintained by Mongoose |
| `index` on `userId` | `1` | Supports the ownership scoping every query applies |
| `index` on `handle` | `1` | Public profile lookup by `linkbase.to/<handle>` — on the `User` schema, which owns the handle |

`strict: true` is already Mongoose's default; declaring it explicitly documents the intent and stops a future global change from silently disabling it.

Two open questions — settle them before the first model ships:

- **`handle` uniqueness is TBD.** The index above is not `unique: true`. A public slug normally needs one, but that is a product decision — do not assume it, and do not rely on duplicate handles being rejected until it is set.
- **Compound `{ userId, handle }` index is TBD.** If handles are looked up within a user (rather than globally), the compound index serves the scoping rule better than two single-field indexes. Decide with the uniqueness question.

---

## Query scoping

**Every query is scoped to the signed-in user's id.** A user can only ever read or write their own documents — no exceptions, including admin-ish paths.

The scoping rule has one hard corollary: **`userId` comes from the session, never from client input.** Form data, search params, and route params are attacker-controlled. Taking a `userId` from any of them turns the filter into a forgery — a caller passes someone else's id and reads their data.

Enforce it in the helper, so no call site can forget:

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

```ts
// src/app/.../actions.ts
"use server";

import { requireUser } from "@/lib/auth"; // session helper from architecture.md

export async function createLink(formData: FormData) {
  const user = await requireUser(); // ← identity from the session
  const title = String(formData.get("title") ?? "");

  await connectToDatabase();
  await LinkModel.create({ userId: user.id, title }); // ← never formData.get("userId")
}
```

Rules that follow:

- **Writes include `userId` in the document** — set it from the session on create, and scope every `updateOne` / `deleteOne` filter by it too. Filtering an update by `_id` alone lets a caller modify another user's document.
- **Resolve identity inside the helper** when practical, so the signature cannot be misused. If a helper takes a `userId`, document that it must be the session id.
- **Never expose a helper that takes a client-supplied `userId`.** If one is genuinely needed (e.g. a public profile lookup), scope it to published/read-only data explicitly rather than reusing the ownership helpers.
- Use `.lean()` on read-only paths — plain objects serialize to Server Components without Mongoose document overhead.

---

## TBD

- `handle` uniqueness and the compound index above.
- Whether `click` counting is an atomic `$inc` or a separate events collection (affects write contention on hot links).
- Migration/seed strategy for the first models.
- Validation error shape returned to forms, and how it pairs with Server Action state types.
