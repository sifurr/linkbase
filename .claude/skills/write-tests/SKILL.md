---
name: write-tests
description: Use whenever the user asks to write or add tests for a feature — "write tests for X", "add tests", "cover this with tests", "write the unit tests". Writes the unit tests for the feature following docs/testing.md, in the locations and style that doc defines. Writes tests only — does not run them, does not run QA, does not commit.
---

# Write Tests

Run this to add tests for a feature. Your job is to write the tests the way `docs/testing.md` prescribes, then stop and hand back.

## Scope — write tests only

- **Write tests only.** Do not run the tests, do not run QA, do not commit, do not push, do not open a PR.
- Running tests and QA are separate, user-triggered steps. Do not pre-empt them.
- Do not change feature code to make tests pass. If the feature looks untestable or buggy, note it in your hand-back rather than editing it.

## 1. Read testing.md first

Read [`docs/testing.md`](../../../docs/testing.md) before writing anything. It is the source of truth for:

- **What to test where** — Vitest unit tests cover **pure functions** and **Zod schemas**; end-to-end flows and Server Actions are covered by MCP-driven QA (the `run-qa-suite` skill), **not** by this skill.
- **File location and naming** — unit tests live **next to the file they test**, named **`*.test.ts`**.
- **Independence** — every test is self-contained: no shared state, no test-order dependencies.
- **The test database** — never point tests at dev or prod data.

If anything below conflicts with `docs/testing.md`, follow the doc.

## 2. Identify what is unit-testable in the feature

Look at the feature's files and pick out the **pure functions** and **Zod schemas** — the deterministic logic `docs/testing.md` assigns to Vitest. Anything that needs the database, a Server Action, or a full user flow is **out of scope here** — that belongs to MCP-driven QA, so leave it for `run-qa-suite`.

## 3. Write the unit tests

For each unit-testable piece, write a Vitest test:

- Place it **beside the file under test**, named **`<file>.test.ts`** (e.g. `lib/validation/link.ts` → `lib/validation/link.test.ts`).
- Follow the project's TypeScript and style conventions (see [`docs/coding-standards.md`](../../../docs/coding-standards.md)).
- Cover the meaningful cases: valid input, invalid/edge input, and schema rejection paths for Zod schemas.
- Keep each test **independent** — no shared mutable state, no reliance on another test having run first.

## 4. Stop and hand back

When the tests are written, **stop**. Do not run them. Report in **2–3 lines** what you added — which files, and roughly what they cover — then hand back to the user.
