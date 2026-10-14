---
name: plan-feature
description: This skill should be used when the user asks to "plan a feature", "scope a new feature", "start a new feature", "add a feature", "build a feature", "design a feature", "plan out", "scope this out", "plan the next feature", or otherwise begins planning, scoping, or specifying feature work before any code is written. Produces a short technical plan grounded in the project's docs/ conventions, ending with QA Scenarios, and waits for explicit approval before implementing anything.
---

# Plan a Feature

Run this at the start of every new feature, before any code is written. The output is a short technical plan the user approves. No implementation until they approve it.

## 1. Enter Plan Mode

Call `EnterPlanMode` first. Do not create, edit, or write any implementation file while planning. Read-only exploration (Read, Grep, Glob) is expected and encouraged.

## 2. Read the docs that govern this feature

Always read:

- `docs/architecture.md` — where files go and what they are named
- `docs/coding-standards.md` — TypeScript and export conventions

Then read every doc matching the feature area:

| Feature touches | Read |
| --- | --- |
| Auth, sessions, protected routes | `docs/auth.md` |
| Any Mongoose model, query, or query helper | `docs/database.md` |
| Reads, caching, `"use cache"`, revalidation | `docs/data-fetching.md` |
| A new route, route group, `error.tsx`, `loading.tsx` | `docs/routing.md` |
| Form input, Server Action results, failure handling | `docs/errors-and-validation.md` |
| Secrets, env vars, headers, rate limits, untrusted URLs | `docs/security.md` |
| Any styling, color, size, or spacing value | `docs/design-system.md` |
| A UI component's props, variants, or states | `docs/ui.md` |
| Branch naming, commit format, PR flow | `docs/git-conventions.md` |

If the feature spans areas, read all of them. If two docs conflict, say so in the plan rather than choosing silently.

## 3. Explore before proposing

Find the code this feature will touch — existing patterns, neighbouring routes, similar models or components. The plan must name paths that actually exist, not invented ones.

## 4. Write the plan

Short and concrete. Two sections.

### Files

Every path that will be created or changed, one line each:

- **create** — `src/lib/db/models/tag.ts` — Tag schema, per `docs/database.md`
- **change** — `src/app/(dashboard)/links/page.tsx` — render the tag filter
- **change** — `src/lib/queries/links.ts` — add `getLinksByTag`

If a file's location is not obvious from `docs/architecture.md`, name the doc that settled it.

### Approach

A short paragraph or a few bullets: the shape of the change, the data flow, and what is deliberately not being built. Call out anything that touches a documented rule — auth enforcement, per-user scoping, cache tags — so the reviewer knows where to look.

Nothing else. No implementation code blocks, no full file contents.

## 5. QA Scenarios

Required, and it ends the plan. Give 3–6 scenarios, one line each, in this form:

**What the user does** → **what should happen**

Cover these four, dropping only those the feature genuinely has no surface for:

1. **Happy path** — the ordinary successful flow.
2. **Auth boundary** — a signed-out user, or a signed-in user reaching another user's data.
3. **Validation** — malformed, missing, or boundary-value input.
4. **Edge cases** — empty state, single item, duplicate, very large, concurrent.

For example:

- Signed-in user submits a valid URL → the link is created and appears at the top of their list
- Signed-out user opens `/links` → redirected to sign-in, no data rendered
- Signed-in user opens another user's link by id → 404, never the other user's data
- URL field left empty → inline error, no request sent, other field values kept
- The same URL added twice → the second is rejected as already saved

Mark anything you could not confirm from the docs as `unverified:` and say what is unknown. Do not invent expected behaviour to fill the section out.

## 6. Wait for explicit approval

Present the plan, then stop. Do not begin implementing, do not scaffold files, do not start work while waiting.

Approval is explicit: the user says to proceed, or approves the plan in Plan Mode. Silence, a question about the plan, or a request to change it is not approval — revise and present it again.

## 7. Save the plan before handing off

Once approved, and before writing any implementation code, save it:

1. Get the branch: `git branch --show-current`
2. Flatten slashes to dashes, so the plan stays flat in `plans/` — `chore/claude-code-setup` becomes `chore-claude-code-setup`
3. Create `plans/` if it does not exist
4. Write the plan to `plans/<flattened-branch>.md`

The saved file is the plan exactly as approved, with a short header naming the branch, the date, and the feature in one line. `plans/` is gitignored, so the plan is a local scratch artifact — it does not travel with the branch or reach a reviewer.

If the branch changes during the feature, save under the new branch name rather than overwriting the previous file.
