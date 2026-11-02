import { connection } from "next/server";

import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/db/models/user";
import { getUserLinks } from "@/lib/links/queries";

export const metadata: Metadata = {
  title: "Dashboard · Linkbase",
  robots: { index: false, follow: false },
};

/**
 * The signed-in home. The proxy gate guarantees an authenticated user with a
 * handle; `requireUser` is the server-side backstop. Reads the user's links
 * (scoped to the session id) and hands them to the client dashboard.
 */
export default async function DashboardPage() {
  // Request-time render before the session read (cacheComponents).
  await connection();
  const sessionUser = await requireUser();

  await dbConnect();
  const user = await User.findById(sessionUser.id).select("handle");
  const handle = user?.handle ?? sessionUser.handle ?? "";
  const links = await getUserLinks(sessionUser.id);

  return <DashboardView handle={handle} links={links} />;
}
