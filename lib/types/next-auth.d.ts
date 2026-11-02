import type { DefaultSession } from "next-auth";

/**
 * Module augmentation so the session and JWT carry our own fields
 * (`id`, `handle`) with types, per Auth.js guidance.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    handle?: string | null;
  }
}

// Augment the module that actually declares `JWT`. `next-auth/jwt` only
// re-exports it (`export * from "@auth/core/jwt"`), so augmenting that
// specifier would create a separate, unused interface.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    handle: string | null;
  }
}
