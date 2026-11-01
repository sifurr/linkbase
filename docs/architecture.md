# Linkbase — Architecture

How the Linkbase codebase is organized and the conventions every file follows. Read this before adding a new file, folder, or Server Action so your work lands in the right place with the right name.

---

## 1. Rendering model

The app uses the **App Router** (`app/` at the repo root — no `src/`).

- **Server Components are the default.** Fetch data, read secrets, and render on the server unless a component needs interactivity.
- **Client Components only where interactivity is needed** — state, effects, event handlers, browser APIs. Mark these with `"use client"` and keep them as small as possible, pushing the `"use client"` boundary down to the leaf that actually needs it.

## 2. Directory layout

| Path | Holds |
|---|---|
| `app/` | Routes, layouts, pages (App Router). |
| `lib/` | Shared, non-UI code. Each concern in its own folder: |
| `lib/db/` | Database client. |
| `lib/auth/` | Auth helpers. |
| `lib/types/` | Shared TypeScript types. |
| `components/ui/` | UI primitives (shared, feature-agnostic). |
| `components/[feature]/` | Feature components, grouped by feature. |

Shared code lives in `lib/`; shared UI lives in `components/`. Don't reach across features for a component — promote it to `components/ui/` if more than one feature needs it.

## 3. Naming conventions

- **Files:** `kebab-case` — e.g. `user-menu.tsx`, `link-card.tsx`, `create-link.ts`.
- **Components:** `PascalCase` — e.g. `UserMenu`, `LinkCard`. (A kebab-case file exports a PascalCase component.)
- **Server Actions:** verb-first — e.g. `createLink`, `deleteWorkspace`, `updateProfile`.
