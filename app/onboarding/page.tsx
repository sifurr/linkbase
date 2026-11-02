import { redirect } from "next/navigation";
import { connection } from "next/server";

import type { Metadata } from "next";

import { HandlePicker } from "@/components/onboarding/handle-picker";
import { requireUser } from "@/lib/auth";
import { POST_ONBOARDING_REDIRECT } from "@/lib/auth/routes";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/db/models/user";

// Private onboarding step — keep it out of search results.
export const metadata: Metadata = {
  title: "Choose your username · Linkbase",
  robots: { index: false, follow: false },
};

const STRIP_DISALLOWED = /[^a-z0-9_-]/g;

/** Seed a few handle suggestions from the user's name or email local-part. */
function buildSuggestions(seedSource: string): string[] {
  const seed =
    seedSource.toLowerCase().replace(STRIP_DISALLOWED, "").slice(0, 20) || "you";
  return Array.from(new Set([seed, `the${seed}`, `${seed}hq`]))
    .filter((candidate) => candidate.length >= 3 && candidate.length <= 30)
    .slice(0, 3);
}

export default async function OnboardingPage() {
  // This page is per-session (reads the auth cookie); mark it request-time so
  // the session read isn't attempted during the static-shell prerender under
  // `cacheComponents`.
  await connection();
  const sessionUser = await requireUser();

  await dbConnect();
  // Read the handle fresh from the DB (not the possibly-stale JWT) so a user who
  // already onboarded never sees this screen again.
  const user = await User.findById(sessionUser.id).select("handle name email");
  if (user?.handle) {
    redirect(POST_ONBOARDING_REDIRECT);
  }

  const seedSource = user?.name || user?.email?.split("@")[0] || "you";
  const suggestions = buildSuggestions(seedSource);

  return <HandlePicker suggestions={suggestions} />;
}
