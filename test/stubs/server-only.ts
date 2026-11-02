/**
 * Test stub for the `server-only` package.
 *
 * `server-only` throws when imported outside a React Server Component, which
 * breaks unit tests that import server modules (e.g. `lib/auth/rate-limit.ts`).
 * `vitest.config.ts` aliases `server-only` to this empty module so those pure
 * functions can be exercised in isolation.
 */
export {};
