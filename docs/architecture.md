# Linkbase — Architecture

Structural conventions for the Linkbase codebase: how code is split between server and client, where shared code lives, and how things are named. Follow these when adding files — they exist so the tree stays predictable as it grows.

**Current state:** `src/` is still the Create Next App scaffold (`src/app/` only). The `lib/` and `components/` trees below are the agreed target layout — create the folders when the first file needs them, not before.

---

## Rendering model

App Router with **React Server Components as the default**. Every component is a Server Component unless it needs interactivity.

- Routes live in `src/app/` — `layout.tsx`, `page.tsx`, `route.ts`, `loading.tsx`, `error.tsx`.
- Add `"use client"` **only** where interactivity is required: state, effects, event handlers, browser APIs, or context providers.
- Push the client boundary as low as it goes — mark the leaf component that needs it, not the page around it. A page stays a Server Component and renders a small Client Component inside.
- Server-side data access stays on the server: fetch and query in Server Components or Server Actions, never in a `"use client"` file.
- **Next 16 specifics** (async `cookies()`/`headers()`/`params`, `proxy` instead of `middleware`, `LayoutProps<"/">`, `"use cache"`) are in `CLAUDE.md` — read it before writing routing or data-fetching code.

---

## Directory layout

All shared code sits under `src/` (path alias `@/*` → `./src/*`).

```
src/
  app/                  routes (App Router)
  lib/
    db/                 database client + queries
    auth/               auth helpers, session access
    types/              shared types
  components/
    ui/                 UI primitives (design-system components)
    [feature]/          feature components, one folder per feature
```

| Path | Holds | Rule |
|------|-------|------|
| `src/lib/db/` | Database client, query functions | The only place the DB driver is imported |
| `src/lib/auth/` | Auth helpers, session/current-user access | The only place the auth library is imported |
| `src/lib/types/` | Shared types used across features | No runtime code |
| `src/components/ui/` | Generic, app-agnostic primitives (`Button`, `Input`, `Card`) | No feature knowledge, no data fetching |
| `src/components/[feature]/` | Components specific to a feature (`links`, `profile`, `admin`) | May compose `ui/` primitives; must not import another feature's components |

**Dependency direction:** `app/` → `components/[feature]/` → `components/ui/`. Feature folders may import `lib/`; `components/ui/` should not. If a feature component is needed by two features, move the shared part into `lib/` or promote it to `components/ui/`.

`components/ui/` primitives follow the props/variants/states contracts in `ui.md`, styled with the tokens in `design-system.md`.

---

## Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files and folders | `kebab-case` | `link-row.tsx`, `create-link.ts`, `src/components/ui/` |
| React components | `PascalCase` | `export function LinkRow()` |
| Server Actions | verb-first, camelCase | `createLink`, `updateProfile`, `deleteLink` |
| Feature folders | `kebab-case`, singular domain noun | `components/link-editor/`, `lib/db/` |

**Server Actions are verb-first** — the name says what the action does, so the call site reads as the operation (`await createLink(formData)`). Paired form-state types follow the action: `CreateLinkState`. A Server Action file is named for its primary action, `kebab-case` (`create-link.ts`), with `"use server"` at the top of the file.

---

## Adding code

- **New shared logic** → `src/lib/` (its own folder if it is a new concern, alongside `db/`, `auth/`, `types/`).
- **New generic component** → `src/components/ui/`, matching an existing `ui.md` contract where one exists.
- **New feature component** → `src/components/<feature>/`.
- **New route** → `src/app/`, kept a Server Component; isolate interactivity in a Client Component.

Anything this doc does not define — caching strategy, data-access patterns, error handling, testing — is **TBD**. Do not invent a convention; agree one first, then record it here.
