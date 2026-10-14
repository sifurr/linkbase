# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: this is Next.js 16, not the Next.js you know

The project runs **Next.js 16.4.0** (App Router, React 19.3). APIs, conventions, and file structure have breaking changes from earlier Next.js versions. Before writing any Next.js code, read the relevant guide in the version-matched docs bundled with the package at `node_modules/next/dist/docs/` (mirrors nextjs.org/docs; App Router docs under `01-app/`). Heed deprecation notices.

`AGENTS.md` at the project root is generated and re-added by `next dev`. It contains a managed "This is NOT the Next.js you know" block. Do not strip it from a diff — commit it as-is to keep the tree clean.

## Commands

- `npm run dev` — dev server on http://localhost:3000 (Turbopack, HMR)
- `npm run build` — production build (Turbopack)
- `npm run start` — serve the production build
- `npm run lint` — ESLint flat config (`next lint` was removed in Next 16, so the script runs `eslint` directly)

There is no test runner or test files configured — no unit-test command exists.

## Architecture

- **App Router** with a `src/` layout: routes live in `src/app/` (`layout.tsx`, `page.tsx`, `globals.css`). Pages Router code, if added, goes in `src/pages/`.
- **Path alias**: `@/*` → `./src/*` (set in `tsconfig.json`).
- **React Server Components by default**; add `"use client"` only where interactivity is needed.
- **Tailwind CSS v4, CSS-first**: `globals.css` opens with `@import "tailwindcss"` and defines tokens via `@theme inline`. There is no `tailwind.config.js`; the `@tailwindcss/turbopack` loader is wired in `next.config.ts`.
- **Fonts** via `next/font/google` (Geist Sans / Mono), exposed as CSS vars `--font-geist-sans` / `--font-geist-mono`.

## Version-specific gotchas (Next 16)

- `next.config.ts` enables `cacheComponents: true` and `partialPrefetching: true` — Cache Components and Partial Prefetching (the Next 16 successors to `experimental.dynamicIO`/`useCache` and Partial Prerendering). Data fetching uses `"use cache"` with `cacheLife`/`cacheTag`; revalidation uses `revalidateTag`/`updateTag`. Read `01-app/01-getting-started/08-caching.md` and `09-revalidating.md` before touching data-fetching code.
- **Async Request APIs**: `cookies()`, `headers()`, `params`, and `searchParams` are now async — `await` them.
- **`middleware` is renamed `proxy`** (file and API).
- **Typed layout props**: `layout.tsx` uses the new `LayoutProps<"/">` signature, not the older untyped `{ children }`.
- Dev and build both default to Turbopack; overrides live in `next.config.ts`.

For runtime verification, `next dev` exposes an MCP server at `/_next/mcp` and forwards browser console errors to the terminal — see `01-app/02-guides/ai-agents.md`.

## Doc Convention

Whenever a new file is created in `docs/`, add it to **Project Docs** below with one line covering what it covers and when to read it. Keep entries in sync when a doc is renamed, moved, or deleted — this index is the only place the docs are discoverable.

## Project Docs

- `docs/architecture.md` — Structural conventions: server/client split, the `src/lib` + `src/components` layout, and naming rules. Read before adding a file, folder, or Server Action so it lands in the right place with the right name.
- `docs/database.md` — MongoDB + Mongoose conventions: the single cached connection, model location, required schema options, and the rule that every query is scoped to the signed-in user's id. Read before writing any model, query, or query helper.
- `docs/design-system.md` — Design tokens (fonts, colors, type scale, spacing, radius, shadows, motion) and layout intents, pulled from the design-system source. Read before styling anything or introducing a new color/size/space value; values absent from it are marked TBD — do not invent them.
- `docs/ui.md` — Component reference: props, variants, states, and the public-profile / admin / marketing layout patterns. Read before building or restyling a UI component; style values quoted there are exact — copy, don't round.
