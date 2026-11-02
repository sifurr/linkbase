import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Mirror the tsconfig `@/*` -> `./*` (root-relative) path alias, and
    // redirect `server-only` to an empty stub so server modules can be
    // unit-tested outside a React Server Component.
    alias: {
      "@/": fileURLToPath(new URL("./", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./test/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
});
