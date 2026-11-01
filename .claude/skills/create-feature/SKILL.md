---
name: create-feature
description: Use after a feature plan is approved — whenever the user starts building, implementing, coding, or says "build it" / "go ahead" / "implement the plan" for an already-approved feature. Builds the feature following the approved plan (see ./plans/<branch>.md) and the /docs conventions, reading the relevant doc files first and pulling live library docs through Context7. Writes code only — no tests, no QA, no commit.
---

# Create Feature

Run this to implement a feature whose plan has already been approved (via the plan-feature skill). Build the code, then stop and hand back.

## Scope — code only

- **Write code only.** Do not write tests, do not run QA, do not commit, do not push, do not open a PR.
- Tests and QA are separate, user-triggered steps (`write-tests`, `run-qa-suite`). Do not pre-empt them.
- Do not expand beyond the approved plan. If implementation reveals the plan is wrong or incomplete, stop and raise it with the user rather than improvising.

## 1. Load the approved plan

Read the plan for the current branch:

```bash
git branch --show-current
```

Read `./plans/<current-branch>.md`. The "Files to create" / "Files to change" lists are your build spec. If no plan file exists, stop and tell the user to run the plan-feature skill first — do not build without an approved plan.

## 2. Read the relevant docs first

Before writing code, read the `/docs` files the plan references, plus any that govern the areas you're touching:

- [`docs/architecture.md`](../../../docs/architecture.md) — layout, Server/Client split, naming (always).
- [`docs/coding-standards.md`](../../../docs/coding-standards.md) — TS strict, imports, components, async/error style (always).
- [`docs/database.md`](../../../docs/database.md) — models, connection, user-scoped queries.
- [`docs/data-fetching.md`](../../../docs/data-fetching.md) — reads in Server Components, scoping, caching.
- [`docs/data-mutations.md`](../../../docs/data-mutations.md) — writes as Server Actions, fixed order, typed results.
- [`docs/auth.md`](../../../docs/auth.md) — sessions, protected routes, session-derived `userId`, ownership checks.
- [`docs/routing.md`](../../../docs/routing.md) — route groups, per-route files, handlers vs. actions.
- [`docs/errors-and-validation.md`](../../../docs/errors-and-validation.md) — Zod at the action boundary, typed vs. thrown errors.
- [`docs/design-system.md`](../../../docs/design-system.md) / [`docs/ui.md`](../../../docs/ui.md) — tokens, component contracts.
- [`docs/security.md`](../../../docs/security.md) — secrets, headers, rate limiting, user content.

## 3. Pull live library docs through Context7

Per CLAUDE.md: before writing any code that uses a library, framework, SDK, or platform API (Next.js, Mongoose, NextAuth, Zod, etc.), pull current docs through Context7 — do not rely on training data for API signatures, config, or version-specific behavior. If Context7 has no entry for a library, say so explicitly. This repo runs **Next.js 16.4.3**; read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices before writing Next.js code.

## 4. Build

Implement the plan's files in a sensible order (schemas/models → validation → data layer → actions → server components → client components → wiring). Follow the conventions from the docs you read. Match existing patterns in the codebase. Keep changes scoped to the plan.

## 5. Stop and report

When the build is done, **stop**. Report in 2–3 lines:

- What was built (the main files/capabilities added or changed).
- Anything the user should know before testing (notable decisions, follow-ups).

Then hand back. Remind the user they can trigger `write-tests` and `run-qa-suite` when ready. Do not continue into testing, QA, or committing.
