---
name: create-feature
description: This skill should be used when the user asks to "build the feature", "implement the plan", "implement the approved plan", "start building", "create the feature", "write the code for", "go ahead and build it", "build it now", or otherwise begins implementing feature work whose plan has already been approved. Builds to the approved plan and the project's docs/ conventions, writes code only — no tests, no QA, no commits — then reports in 2-3 lines and hands back.
---

# Create a Feature

Run this after a plan has been approved. Build the feature to that plan, following the project's `docs/` conventions. Write code, then stop.

## 1. Confirm there is an approved plan

Look for the saved plan at `plans/<flattened-branch>.md`, where the branch from `git branch --show-current` has its slashes flattened to dashes (`chore/claude-code-setup` → `chore-claude-code-setup`).

- If it exists, read it and build to it.
- If it does not, use the plan approved earlier in this conversation.
- If neither exists, or the plan was never approved, **stop and say so.** Do not build from an unapproved or half-finished plan — ask for the plan first.

## 2. Read the docs that govern the build

Always read:

- `docs/architecture.md` — where files go and what they are named
- `docs/coding-standards.md` — TypeScript, import order, export style

Then read every doc matching the area being built:

| Building | Read |
| --- | --- |
| Auth, sessions, protected routes | `docs/auth.md` |
| A Mongoose model, query, or query helper | `docs/database.md` |
| Reads, caching, `"use cache"`, revalidation | `docs/data-fetching.md` |
| A new route, route group, `error.tsx`, `loading.tsx` | `docs/routing.md` |
| Form input, Server Action results, failure handling | `docs/errors-and-validation.md` |
| Secrets, env vars, headers, rate limits, untrusted URLs | `docs/security.md` |
| Styling, color, size, or spacing values | `docs/design-system.md` |
| A UI component's props, variants, or states | `docs/ui.md` |

If the plan and a doc disagree once you are in the code, stop and say which one you think is wrong. Do not quietly pick one.

## 3. Pull live library docs before writing library code

Before writing code that touches Next.js, Mongoose, NextAuth, Zod, or any other library, pull the current docs through Context7 (`resolve-library-id`, then `query-docs`). Do not rely on recall for API signatures, config options, or version-specific behavior — the versions pinned in `package.json` are what run here.

Two rules that carry real weight in this repo:

- **Next.js 16 specifics come from the bundled docs**, `node_modules/next/dist/docs/`, which stay the authority. Use Context7 to cross-check anything version-dependent.
- **If Context7 has no entry for a library, say so before proceeding.** Name what you could not verify and let the user decide. Do not silently fall back on training data.

Query the specific concept you are about to use, not the library in general.

## 4. Build

Work through the plan's **Files** section in order. For each entry:

- Write it exactly where the plan says. If the location turns out to be wrong, stop and say so rather than relocating it silently.
- Match the surrounding code — its comment density, naming, and idiom.
- Keep to the plan's scope. Do not add files, abstractions, or "while I'm here" fixes that the plan does not name. If you think one is needed, stop and raise it.

Build the feature so it actually works end to end, not so it merely compiles: wire the pieces together, and make sure the paths the plan described are the paths that exist when you are done.

## 5. Do not do these

This skill writes code and nothing else. While running it, do not:

- **Write tests.** No test files, no fixtures, no test helpers — not even a small one.
- **Run QA.** Do not work through the plan's QA Scenarios, and do not report on them.
- **Commit.** No `git add`, `git commit`, branching, or pushing. Leave the working tree for the user to review.

The user triggers `write-tests` and `run-qa-suite` explicitly when ready. Their absence here is deliberate, not an oversight — do not offer them, and do not suggest them as a next step beyond a single line saying they can be triggered when the user wants.

## 6. Stop and hand back

When the build is done, stop. Report in **2–3 lines**:

1. What was built.
2. The files created or changed.

Then hand back. No test results, no QA commentary, no commit, no unsolicited next steps. If you left something unfinished or deviated from the plan, that goes in the report — a short accurate report beats a complete-looking one.
