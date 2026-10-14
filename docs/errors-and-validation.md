# Linkbase — Errors & Validation

Where input is validated, what a validation failure returns, and what happens when something genuinely breaks.

The organising rule is one distinction, and almost every decision below follows from it.

| | **Expected errors** | **Unexpected errors** |
|---|---|---|
| Examples | Bad form input, failed request, resource not found | Bugs, downed dependency, corrupt data |
| Handling | **Return a typed value** | **Throw** |
| Reaches the client as | Field-level messages the form renders | A generic message + `error.digest` |
| Where handled | The form, via `useActionState` state | The nearest `error.tsx` |
| Logged? | No — routine | **Yes, with full context** |

Next's guidance is explicit: for expected errors, *"avoid using `try`/`catch` blocks and throw errors. Instead, model expected errors as return values."* Throwing is reserved for the second column.

**Current state:** Zod is not installed. `npm install zod` and pin the version in `package.json` — the API below is **Zod 4**.

---

## Validation

**All input is validated with Zod at the Server Action boundary, before anything touches the database.** No exceptions: if a value crosses from the client into a query, it was parsed first.

Shared schemas live in **`src/lib/validation/`** — one file per domain (`link.ts`, `profile.ts`), exporting both the schema and its inferred input type:

```ts
// src/lib/validation/link.ts
import { z } from "zod";

export const createLinkSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  url: z.url({ message: "Enter a valid URL" }),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
```

**Write user-facing messages on every validation.** Zod's defaults are developer-facing — `"Invalid input: expected string, received number"` — and these get rendered *inline next to a field*, so the default text is what a user would read. Always pass a `message`/`error` that a person can act on.

`safeParse`, **not** `parse`. An action that renders a form should never throw on bad input — `parse` throws, which pushes a routine validation failure into the unexpected-error path where the user loses their input.

### Order inside an action

1. **`requireUser()`** — establish identity first (`auth.md`).
2. **Validate** with `safeParse`.
3. **Touch the database**, scoped to `session.userId` (`database.md`).

Identity before validation so an unauthenticated caller is rejected before any work happens.

### What gets validated

| Input | Validated? | Where |
|-------|-----------|-------|
| Server Action form data | **Yes, always** | The action boundary |
| Route params and `searchParams` | **Yes** — they are client-controlled | `params`/`searchParams` are `Promise`s in Next 16 (`routing.md`) |
| Webhook bodies | **Yes** — but verify the signature *first* | `routing.md` |
| Environment variables | **Yes, once at startup** — a Zod schema over `process.env`, fail fast | `src/lib/env.ts` |
| Documents read back from Mongo | No — trust the write path, project the fields | `database.md`, `auth.md` |

---

## The typed result

A discriminated union the form can switch on. `ActionState` lives beside the schemas:

```ts
// src/lib/validation/types.ts
export type FieldErrors = Record<string, string[]>;

export type ActionState<T = undefined> =
  | { status: "idle" }
  | { status: "success"; data: T }
  | { status: "error"; fieldErrors?: FieldErrors; formError?: string };
```

The action returns it, never throws for bad input:

```ts
// src/app/(dashboard)/add-links/actions.ts
"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createLinkSchema } from "@/lib/validation/link";
import type { ActionState } from "@/lib/validation/types";
import { createLinkForUser } from "@/lib/db/links";

export async function createLink(
  prevState: ActionState, // ← (prevState, formData) is required by useActionState
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = createLinkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    const { fieldErrors, formErrors } = z.flattenError(parsed.error);
    return { status: "error", fieldErrors, formError: formErrors[0] };
  }

  await createLinkForUser(user.id, parsed.data);
  return { status: "success", data: undefined };
}
```

**Zod 4 notes** (the API changed from v3):

- `z.flattenError(result.error)` is a **top-level function** → `{ formErrors: string[], fieldErrors: Record<string, string[]> }`. The v3 instance methods `error.flatten()` and `error.format()` are deprecated.
- `fieldErrors` values are **arrays** (`string[]`), so a single inline message is `fieldErrors.title?.[0]`.
- `error.errors` is gone — use **`error.issues`**.
- **`flattenError` only handles one level.** Use `z.treeifyError()` for nested schemas; `flattenError` silently gives nothing useful for nested paths.
- Next's own error-handling example types `prevState` as `any`. **This project's lint rejects `any`** (`coding-standards.md`) — type it as `ActionState`.

Rendering, mapping straight onto the `Input` component's `error` prop from `ui.md` (which already flips to the `--berry` invalid style):

```tsx
"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { createLink } from "./actions";

export function AddLinkForm() {
  const [state, formAction, pending] = useActionState(createLink, { status: "idle" });
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction}>
      <Input name="title" label="Title" error={errors?.title?.[0]} />
      <Input name="url" label="URL" error={errors?.url?.[0]} />
      {state.status === "error" && state.formError && (
        <p role="alert">{state.formError}</p>
      )}
      <button disabled={pending}>Add link</button>
    </form>
  );
}
```

`useActionState` is React 19's hook (the rename of `useFormState`). The `pending` flag is the third element — use it rather than a separate `useFormStatus` in most cases.

For a **missing resource**, call `notFound()` from `next/navigation` and let `not-found.tsx` render — do not throw a custom error for a 404.

---

## Unexpected errors

Everything else **throws a real `Error` object** (`coding-standards.md` — never a string), and is caught by the nearest `error.tsx`.

**The mechanism:** a Server Action runs inside a transition, and Next's docs confirm that unhandled errors in a transition bubble up to the nearest error boundary. That is why throwing in an action surfaces the segment's `error.tsx` rather than crashing the page.

Error boundaries **do not** catch errors from event handlers or from async code that settles after render. Two consequences:

- A thrown Server Action error *is* caught; a failure inside a `.then()` in a click handler is **not**. This is a second reason for the no-`.then()` rule in `coding-standards.md`.
- For component-level recovery inside a page, Next 16 exposes `catchError` from `next/error`, which builds an error boundary around any part of the tree and takes `{ error, retry }` — useful when a route-segment `error.tsx` is too coarse.

Carry over the `error.tsx` gotchas from `routing.md`: it must be a Client Component (`"use client"`), the recovery prop is **`retry`** (not `reset`), and it does not catch errors from its own segment's `layout.tsx`.

### Logging with enough context

Catching to log is the one place a `try`/`catch` belongs. Log server-side, then rethrow so the boundary still fires:

```ts
// src/lib/errors.ts
export function logError(error: unknown, context: Record<string, unknown>) {
  console.error({
    ...context, // action, userId, resourceId, etc.
    error: error instanceof Error ? error.name : typeof error,
    message: error instanceof Error ? error.message : undefined,
    stack: error instanceof Error ? error.stack : undefined,
  });
}
```

What to include: the **action or helper name**, the **user id**, the **resource id** involved, and the **`error.digest`** if present. What to leave out: tokens, session cookies, passwords, full documents, and anything PII — log the identifier, not the record.

A thrown error must never be silently swallowed: no empty `catch {}`, and no `catch` that logs and returns `undefined` (`coding-standards.md`).

---

## Never leak internals

Next already protects the common case: in production, server-thrown errors reach the client as a **generic message plus `error.digest`**, with the digest matching the server log. But do not lean on that alone:

- **Never render `error.message`** in an `error.tsx`. Show fixed copy plus the digest; log the real message.
- **Never return a raw driver or ORM error.** Mongoose validation errors expose schema shape and field names; connection errors can expose the URI. Convert at the data boundary into a domain error (`database.md`) or let it throw and be logged — never pass it through to a result object.
- **4xx-shaped problems are safe to describe; 5xx-shaped ones are not.** "That URL is already taken" is fine. "E11000 duplicate key error collection: linkbase.links index: handle_1" is not.
- **Do not return a Zod error object wholesale.** `fieldErrors` is intended for the user; `issues` with full paths, codes, and internal schema detail is not. Send the flattened, human-readable shape only.
- In development Next deliberately forwards more detail than production. Do not test leak behaviour in dev and assume it holds in prod.

---

## TBD

- Zod version pin, and whether to centralise messages for future i18n.
- Error-reporting service (Sentry or similar) and the boundary hookup.
- Logger choice — `console` above is a placeholder; needs structured output and redaction.
- Whether `authInterrupts` gets enabled for a real 401/403 UI instead of a redirect (`routing.md`).
- A `requestId` threaded through actions so client-visible digests correlate cleanly with logs.
- Retry/backoff policy for transient database failures.

**Reference:** [Zod — Formatting errors](https://zod.dev/error-formatting)
