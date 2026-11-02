import { handlers } from "@/auth";

// NextAuth's own callback endpoint — the sanctioned Route Handler exception
// to the "Server Actions only" rule (`docs/routing.md` §5).
export const { GET, POST } = handlers;
