# Linkbase — Coding Standards

TypeScript, formatting, linting, import order, and the small rules that keep diffs boring. Structural conventions (where files go) are in `architecture.md`; this doc covers how the code inside them is written.

## What is already enforced

| Rule | Status | Source |
|------|--------|--------|
| TypeScript `strict` | **On** | `tsconfig.json:7` |
| No `any` | **On, error** | `next/typescript` → typescript-eslint `recommended` |
| `@ts-ignore` banned | **On, error** | same — see [ts-ignore](#ts-ignore) |
| Prettier | **Not installed** | absent from `package.json` |
| Import order | **Not enforced by anything** | see [Imports](#imports) |

`eslint.config.mjs` wires `next/core-web-vitals` + `next/typescript`. The latter is typescript-eslint's `recommended` set with `no-unused-vars` and `no-unused-expressions` downgraded to `warn`, so type-aware rules are **not** active — that is a deliberate, smaller rule set, not an oversight.

`npm run lint` runs `eslint` directly (`next lint` was removed in Next 16).

---

## TypeScript

`strict: true` is on. Do not weaken it per-file; a `// @ts-nocheck` is an error by default.

**`strict` does not include everything you might assume.** These are off and are the ones worth turning on:

| Flag | Catches |
|------|---------|
| `noUncheckedIndexedAccess` | `arr[0]` and `record[key]` typed as possibly `undefined` — the big one |
| `exactOptionalPropertyTypes` | `{ a?: string }` rejecting `{ a: undefined }` |
| `noImplicitOverride` | Missing `override` on subclass members |
| `noFallthroughCasesInSwitch` | Accidental `switch` fallthrough |
| `verbatimModuleSyntax` | Forces `import type`, keeping type-only imports out of the bundle |

Turning these on is **TBD** — they will surface existing errors, so enable them one at a time rather than all at once.

- **No `any`.** It is an error today. Reach for `unknown` and narrow, or a generic. If a third-party type is genuinely wrong, type the boundary and convert to a known shape once, at the edge.
- Prefer `import type` for type-only imports so they erase cleanly.
- Model states that cannot happen as unions — this is what removes the need for most `any`.

---

## Formatting & linting

**Prettier is not installed.** To adopt it:

```bash
npm install -D prettier eslint-config-prettier
```

`eslint-config-prettier` is not optional — it **must be appended last** in `eslint.config.mjs` to switch off stylistic rules that fight the formatter. Without it you get lint errors on code Prettier just formatted.

```js
// eslint.config.mjs — add as the LAST entry
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier, // last: disables rules that conflict with Prettier
  globalIgnores([/* ...existing... */]),
]);
```

A `.prettierrc` does not exist yet; its settings (`printWidth`, `singleQuote`) are **TBD**. Pick once and commit — a formatter with no config drifts as people run it with defaults.

---

## Imports

Order, always:

1. **External packages** — `react`, `next/server`, `mongoose`
2. **Internal aliases** — `@/lib/...`, then `@/components/...`
3. **Relative** — `./`, `../`

**Nothing currently enforces this.** Prettier deliberately does not sort imports, and no ESLint core rule does either — so as written it is a convention that will erode. To make it real, add the sorting plugin:

```bash
npm install -D @ianvs/prettier-plugin-sort-imports
```

```jsonc
// .prettierrc
{
  "plugins": ["@ianvs/prettier-plugin-sort-imports"],
  "importOrder": [
    "<BUILTIN_MODULES>",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/lib/(.*)$",
    "^@/components/(.*)$",
    "^@/(.*)$",
    "",
    "^[.]"
  ]
}
```

The `^@/(.*)$` line catches alias paths beyond `lib` and `components` (e.g. `@/app`); without it those sort unpredictably.

- **No relative escapes upward past `src/`** — use the `@/` alias. `../../lib/db` is the failure mode this prevents, and it breaks the moment a file moves.
- Relative imports are for siblings in the same feature folder only.

---

## Components

- **Function declarations**, not arrow functions assigned to a const — `export function LinkRow(props: LinkRowProps) {}`. Named declarations give readable stack traces and hoist for free.
- **Typed props**: an explicit `type XProps` for the props object. Do not type against an inline object literal, so the type is nameable in errors and reusable.
- Props types are local to the file unless shared — shared ones go to `src/lib/types/` per `architecture.md`.
- Props are read-only; do not mutate them.
- **No default exports**, with one exception: Next.js route files, which the framework requires to be default-exports.

| File | Export style |
|------|--------------|
| `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `template.tsx`, `default.tsx` | **default** (required by Next) |
| `src/proxy.ts` | **default** (required by Next) |
| `route.ts` | **named** — `export async function GET()`; a default export is not used |
| Everything else — components, actions, helpers, models | **named only** |

`route.ts` is worth calling out because it looks like a route file but takes named HTTP-method exports, not a default. The exceptions above are the framework's requirements leaking into our standard — nowhere else should a default export appear.

---

## Async

- **`async`/`await` only. Never `.then()` chains** — including `.then().catch()` and `void promise.then(...)`. A chain loses the stack context and, in Server Components, a floating `.then` is an unhandled rejection.
- Await `cookies()`, `headers()`, `params`, and `searchParams` — all async in Next 16.
- When invoking a promise without awaiting, say so explicitly; do not leave it floating.
- Parallelize independent work with `Promise.all` rather than sequential awaits.
- `for await` over streams; do not mix callback styles into an async function.

---

## Errors

- **Throw real `Error` objects, never strings.** `throw "not found"` loses the stack and fails `instanceof Error`; every catch site then has to guess. `throw new Error("...")` is the floor.
- **Subclass for domain errors** so callers can branch on type instead of parsing messages:

```ts
export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}
```

Set `this.name` — otherwise the class name is lost in logs and error reporting.

- **Include the useful context in the message**: the id, the helper, what was expected. "Failed to load links for user 8f2…" beats "error".
- **Do not swallow.** A bare `catch {}` or a `catch` that logs and returns `undefined` turns a failure into a wrong answer. If recovery is real, say what is being recovered; if not, rethrow.
- **Validation failures are not exceptions.** Bad form input is an expected outcome — return it as Server Action state so the form can render it. Throw only for unexpected failures (a missing document that should exist, a downed dependency). Pair with the error-shape item in `database.md`'s TBD list.
- Never leak internals to the client: log the real error server-side, return a generic message.

---

## ts-ignore

Your rule — no `@ts-ignore` without a comment explaining why — is **already stricter than that in practice**, and the details are easy to get wrong.

`next/typescript` enables `@typescript-eslint/ban-ts-comment` **as an error**, with these defaults:

| Directive | Default |
|-----------|---------|
| `@ts-ignore` | **banned outright** — a comment does *not* make it acceptable |
| `@ts-nocheck` | **banned outright** |
| `@ts-expect-error` | allowed **with a description** (≥ 3 chars) |
| `@ts-check` | not allowed |

So today, any `@ts-ignore` is a lint error. Keep it that way:

- **Use `@ts-expect-error` with a description, never `@ts-ignore`.** `@ts-expect-error` fails the build once the underlying error is fixed — it is self-cleaning. `@ts-ignore` suppresses silently and lingers forever after the reason is gone.
- The description states **why the suppression is correct**, not what it does: `// @ts-expect-error — Mongoose types lag the driver's findOneAndUpdate overload` is useful; `// @ts-expect-error — type error` is not.
- Suppress the narrowest possible line.

If you genuinely want `@ts-ignore` permitted-with-a-reason instead of banned, that is a deliberate loosening — add it explicitly rather than assuming a comment already satisfies the rule:

```js
// eslint.config.mjs
{
  rules: {
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description", "ts-expect-error": "allow-with-description" },
    ],
  },
}
```

**Recommendation: keep the default.** Banning `@ts-ignore` outright removes the footgun; `@ts-expect-error` already covers the legitimate need.

---

## TBD

- Prettier config values, and whether to add a `format` npm script / pre-commit hook.
- Enabling the stricter tsconfig flags above, one at a time.
- Import-order tooling: adopt the plugin, or leave the order as review-enforced convention.
- Whether type-aware lint rules (`recommended-type-checked`) are worth the slower lint run.
