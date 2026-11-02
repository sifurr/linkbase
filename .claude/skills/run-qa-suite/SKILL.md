---
name: run-qa-suite
description: Use whenever the user asks to run QA, run the QA suite, test the app, do end-to-end testing, verify a feature end-to-end, or check that the app works in the browser. Drives the running app at localhost:3000 with Playwright MCP through the current branch's QA scenarios (happy path, auth boundary, validation, edge cases) against the test database, fixing failures in code and re-running until green, then reports a summary.
---

# Run QA Suite

Run the end-to-end QA scenarios for the current feature against the app in a real browser, fix anything that fails, and report when everything is green. This is the **Playwright MCP end-to-end QA** layer described in [`docs/testing.md`](../../../docs/testing.md) — not Vitest unit tests.

## Scope

- **Do** drive the running app through the scenarios, diagnose failures, fix them in code, and re-run.
- **Do not** write or commit `.spec.ts` / config files — the scenarios live in the plan and this skill, never in checked-in test files (see `docs/testing.md` §3).
- **Do not** commit, push, or open a PR. Report and stop.

## 1. Load the scenarios

1. Get the branch: `git branch --show-current`.
2. Read the plan at **`plans/<branch>.md`** (e.g. branch `feat/auth` → `plans/feat/auth.md`). A branch name with a `/` is a real subpath.
3. Use its **QA Scenarios** section as the suite. If the file or that section is missing, stop and tell the user there are no scenarios to run for this branch.

Each scenario should be exercised across the four axes the plan implies:
- **Happy path** — the feature works for a valid, authorized user.
- **Auth boundary** — unauthenticated/unauthorized access is blocked; identity is server-derived, never trusted from client input.
- **Validation** — bad input returns typed, inline errors; nothing is written; no stack trace reaches the client.
- **Edge cases** — duplicates, rate limits, empty states, and anything else the plan calls out.

## 2. Point the app at the TEST database (required, before any scenario)

QA must **never** touch the dev or prod database (`docs/testing.md` §4, `docs/security.md`).

The app (`lib/db/index.ts`) always reads `process.env.MONGODB_URI` — it does **not** read `MONGODB_URI_TEST` itself. So QA takes the test connection string from `MONGODB_URI_TEST` and launches the server with it assigned to `MONGODB_URI`.

1. Read **`.env.test`** and take **`MONGODB_URI_TEST`**. If it is missing, stop and tell the user to set it in `.env.test` (see `.env.example`). **Confirm the DB name ends in `-test`** before proceeding — if it looks like a dev/prod DB, stop and report.
2. Launch (or relaunch) the dev server the browser will hit with `MONGODB_URI` set to that value, so the app connects to the test DB rather than the dev `.env.local` one — e.g. `MONGODB_URI="$MONGODB_URI_TEST" npm run dev`. If a dev server is already running against the dev DB, stop it first. Then wait for `localhost:3000` to respond.
3. Only continue once you've verified the app is talking to the `-test` database.

## 3. Reset test DB state between scenario runs

Tests are **independent** — no shared state, no order dependencies (`docs/testing.md` §5).

- Before each scenario (and after one that wrote data), clear the collections the scenario touches in the test database so every scenario starts clean and sets up its own data.
- Never reset anything but the test database — re-confirm the target is the `-test` DB before each reset.

## 4. Drive the scenarios with Playwright MCP

For each scenario, use the `mcp__playwright__*` tools against `http://localhost:3000`:
- `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_fill_form`, `browser_wait_for` to walk the flow.
- Assert on the rendered DOM (snapshot), the URL, and where relevant the test DB state and `browser_console_messages` / `browser_network_requests` (e.g. no leaked stack trace, correct redirect, no unexpected 500s).
- Treat a scenario as **passing** only when its expected outcome in the plan is observed.

## 5. On failure: diagnose, fix in code, re-run (max 3 attempts)

When a scenario fails:
1. Diagnose the root cause from the snapshot, console, network, and server logs.
2. **Fix it in the code**, following the `/docs` conventions and pulling live library docs through Context7 for any library/framework API.
3. Reset the relevant test DB state and re-run **that** scenario.
4. Cap at **3 attempts on the same failure**. If it still fails after the third, **stop** and report what's blocking — the scenario, the failure, what you tried, and your best diagnosis — rather than thrashing further.

Then continue with the remaining scenarios.

## 6. On all green: report and stop

When every scenario passes, close the browser (`browser_close`) and report a short summary:
- which scenarios ran and that each passed, grouped by axis (happy path / auth boundary / validation / edge cases);
- any code fixes you made to get to green;
- confirmation that QA ran against the `-test` database.

Then stop. Do not commit, push, or open a PR.
