import { AuthLinks } from "@/components/auth/auth-links";
import { UserMenu } from "@/components/auth/user-menu";
import { getCurrentUser } from "@/lib/auth";

/**
 * The header's only session read. It must stay behind a `<Suspense>` boundary
 * (see `SiteHeader`): with Cache Components enabled, reading the session can't
 * be prerendered, so this streams in while the rest of the header is static.
 */
export async function HeaderAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return <AuthLinks />;
  }

  return <UserMenu name={user.name ?? null} email={user.email ?? ""} />;
}
