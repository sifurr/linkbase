---
name: plan-feature
description: Use at the very start of any new feature — whenever the user starts planning, scoping, designing, or asking "how should we build" a feature, capability, page, route, model, or Server Action, before any code is written. Enters Plan Mode and produces a short, docs-aligned technical plan (files to create/change) plus QA scenarios, waits for explicit approval, then writes the approved plan to ./plans/<branch>.md.
---

# Plan Feature

Run this before writing any code for a new feature. Your job is to produce a short technical plan, get it explicitly approved, and persist it — **not** to implement anything.

## 1. Enter Plan Mode

Call `EnterPlanMode` immediately. Do not create, edit, or run anything that changes the repo while planning. Read-only investigation (reading files, searching, reading `/docs`) is expected.

## 2. Read the relevant docs first

Before drafting, read the project docs that govern this feature so the plan stays consistent with conventions. Always consult:

- [`docs/architecture.md`](../../../docs/architecture.md) — directory layout, Server/Client split, naming.

Then read whichever match the feature area:

- Data reads → [`docs/data-fetching.md`](../../../docs/data-fetching.md)
- Data writes / mutations → [`docs/data-mutations.md`](../../../docs/data-mutations.md)
- Models / queries → [`docs/database.md`](../../../docs/database.md)
- Auth, sessions, protected routes, identity → [`docs/auth.md`](../../../docs/auth.md)
- New route / route group / handler → [`docs/routing.md`](../../../docs/routing.md)
- Validation / error boundaries → [`docs/errors-and-validation.md`](../../../docs/errors-and-validation.md)
- Styling / tokens → [`docs/design-system.md`](../../../docs/design-system.md)
- Shared UI components → [`docs/ui.md`](../../../docs/ui.md)
- Secrets, headers, rate limiting, user content → [`docs/security.md`](../../../docs/security.md)
- Any code style question → [`docs/coding-standards.md`](../../../docs/coding-standards.md)

Per CLAUDE.md: pull current library docs through Context7 and read the Next.js 16 guides in `node_modules/next/dist/docs/` before planning anything that depends on them.

## 3. Draft the plan

Keep it short and concrete. Structure:

- **Feature** — one or two sentences on what's being built.
- **Files to create** — each path with a one-line purpose.
- **Files to change** — each path with what changes and why.
- **Docs referenced** — cite the specific `/docs` files that shaped the plan, noting any convention that constrains the design (e.g. "writes go through a Server Action per `docs/data-mutations.md`").
- **Open questions** — anything you need the user to decide (omit if none).

Cite the relevant doc inline next to the decision it drives so the plan is traceable.

## 4. QA Scenarios

End the plan with a **QA Scenarios** section: 3–6 concrete scenarios. One line each — what the user does → what should happen. Cover, at minimum:

- **Happy path** — the normal successful flow.
- **Auth boundary** — unauthenticated/unauthorized access, or acting on another user's data.
- **Validation** — invalid or malformed input is rejected with a typed error.
- **Edge case(s)** — empty states, duplicates, limits, or other realistic corner cases.

## 5. Wait for explicit approval

Present the plan with `ExitPlanMode` and stop. **Write no code until the user explicitly approves.** If they request changes, revise and re-present. Approval of the plan is approval to plan-persist and implement — not a license to skip the steps below.

## 6. Persist the approved plan

Once approved, before handing off to implementation, determine the branch and write the plan:

```bash
git branch --show-current
```

Write the full approved plan (including QA Scenarios) to `./plans/<current-branch>.md`. Branch names contain slashes (e.g. `chore/claude-code-setup`), so create parent directories first:

```bash
mkdir -p "plans/$(dirname "$(git branch --show-current)")"
```

Then write the file at `plans/<current-branch>.md`. Confirm the path to the user, then proceed with implementation.
