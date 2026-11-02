import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/db/models/user";
import { loginSchema } from "@/lib/validation/auth";

/**
 * Full Auth.js instance (Node runtime): the Credentials provider does the DB
 * lookup and bcrypt comparison, and the callbacks put `id`/`handle` onto the
 * JWT and session. Session strategy is JWT — required for Credentials, and it
 * needs no database adapter.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        await dbConnect();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.passwordHash,
        );
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
          handle: user.handle ?? null,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.handle = user.handle ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.handle = token.handle;
      return session;
    },
  },
});
