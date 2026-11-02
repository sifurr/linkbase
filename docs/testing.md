# Linkbase — Testing

How Linkbase is tested: fast unit tests for pure logic, and MCP-driven end-to-end QA for everything that touches the database or a Server Action. Read this before writing a test, adding a test tool, or wiring up QA.

---

## 1. Two layers, two tools

- **Unit tests → Vitest.** For **pure functions** and **Zod schemas** — logic with no I/O, no database, no network.
- **End-to-end QA → Playwright MCP**, driven by the **`run-qa-suite`** skill. For full user flows, including anything that reads or writes the database.

## 2. Unit tests (Vitest)

- Cover **pure functions** and **Zod schemas** (see [`errors-and-validation.md`](errors-and-validation.md)) — deterministic logic that takes input and returns output.
- A test lives **next to the file it tests**, named **`*.test.ts`** (e.g. `lib/validation/link.ts` → `lib/validation/link.test.ts`).

## 3. End-to-end QA (Playwright MCP)

- QA is driven through **Playwright MCP** via the **`run-qa-suite`** skill — there is **no `/e2e` folder, no `playwright.config.ts`, and no committed `.spec.ts` files**. The scenarios live in the skill, not in checked-in test files.
- **Server Actions are tested through MCP-driven QA**, exercised as real user flows — **not mocked** (see [`data-mutations.md`](data-mutations.md)).

## 4. Test database

- QA runs against a **separate test database**, configured via **`MONGODB_URI_TEST`** in **`.env.test`**.
- **Never** run tests or QA against the **dev or prod database** (see [`database.md`](database.md), [`security.md`](security.md)).

## 5. Independence

- **Every test is independent.** No shared state, no test-order dependencies — each test sets up and tears down whatever it needs and passes in isolation.
