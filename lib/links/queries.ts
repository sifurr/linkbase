import "server-only";

import { dbConnect } from "@/lib/db";
import { Link } from "@/lib/db/models/link";
import type { LinkView } from "@/lib/links/types";

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
