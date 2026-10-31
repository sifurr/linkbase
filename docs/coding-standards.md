# Linkbase — Coding Standards

The conventions every TypeScript file in Linkbase follows. Read this before writing code so your work matches the rest of the codebase and passes lint.

---

## 1. TypeScript, strict mode

All code is **TypeScript** with **`strict` mode on**. The compiler's strict checks are a feature, not an obstacle — satisfy them rather than working around them.

- **No `any`.** Reach for a precise type, a generic, or `unknown` with narrowing instead.
- **No `@ts-ignore` / `@ts-expect-error` without a comment** explaining why it's there and what makes it safe.

## 2. Formatting & linting

- Code is formatted with **Prettier** — don't hand-format; let Prettier own whitespace, quotes, and line breaks.
- Code is linted with **ESLint** using the **Next.js config** (`eslint-config-next`, core-web-vitals + typescript). Fix lint findings; don't disable rules to silence them.

## 3. Import order

Imports are grouped in this order, blank line between groups:

1. **External packages** — `react`, `next`, `mongoose`, …
2. **Internal aliases** — `@/lib/*`, `@/components/*`.
3. **Relative imports** — `./`, `../`.

## 4. Components

- Components are **function declarations** with **typed props** — not arrow-function consts.
- **No default exports**, except for **Next.js route files** (`page.tsx`, `layout.tsx`, `route.ts`, etc.), where the framework requires them.

## 5. Async & errors

- Async work uses **`async` / `await`** — never `.then()` chains.
- Errors are thrown with **real `Error` objects** (`throw new Error("…")`), never bare strings.
