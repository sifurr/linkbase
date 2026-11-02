import "server-only";

import { dbConnect } from "@/lib/db";
import { Link } from "@/lib/db/models/link";
import { User } from "@/lib/db/models/user";
import type { LinkView, PublicProfile } from "@/lib/links/types";

/**
 * Read a user's links for the dashboard, newest first. Runs in a Server
 * Component; scoped to the session `userId` (never client input), per
 * `docs/data-fetching.md` §2. Returns plain serializable objects for props.
 */
export async function getUserLinks(userId: string): Promise<LinkView[]> {
  await dbConnect();
  const docs = await Link.find({ userId })
    .sort({ createdAt: -1 })
    .select("title url")
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    url: doc.url,
  }));
}

/**
 * Read a public profile by its route `handle` (never a session id), per
 * `docs/data-fetching.md` §2 and `docs/auth.md` §3. Selects only the
 * profile-safe fields — `handle` and `name`, never `email`/`passwordHash` —
 * then the user's links newest-first. Returns `null` for an unknown handle so
 * the page can render a 404. No session is required; this route is public.
 */
export async function getPublicProfile(
  handle: string,
): Promise<PublicProfile | null> {
  const normalized = handle.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  await dbConnect();
  const user = await User.findOne({ handle: normalized })
    .select("handle name")
    .lean();
  if (!user?.handle) {
    return null;
  }

  const docs = await Link.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .select("title url")
    .lean();

  return {
    handle: user.handle,
    name: user.name ?? undefined,
    links: docs.map((doc) => ({
      id: String(doc._id),
      title: doc.title,
      url: doc.url,
    })),
  };
}
