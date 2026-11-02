"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { requireUser, updateSession } from "@/lib/auth";
import { rateLimit } from "@/lib/auth/rate-limit";
import { POST_ONBOARDING_REDIRECT } from "@/lib/auth/routes";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/db/models/user";
import type { HandleCheckResult, HandleFormState } from "@/lib/onboarding/types";
import {
  HANDLE_MIN,
  RESERVED_HANDLES,
  handleSchema,
} from "@/lib/validation/handle";

const RATE_LIMIT_WINDOW_MS = 60_000;
const SUBMIT_MAX = 10;
const CHECK_MAX = 60;

const TOO_MANY_ATTEMPTS =
  "Too many attempts. Please wait a minute and try again.";

async function clientKey(scope: string): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

/** Mongo duplicate-key error (the sparse-unique `handle` index). */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

/**
 * Set the signed-in user's handle, then send them to the landing page. Follows
 * the fixed mutation order (`docs/data-mutations.md` §2): session → rate limit →
 * validate → scope to the session's user id → write → refresh session → revalidate.
 * Expected failures (invalid, taken) are returned inline; only unexpected errors
 * throw to `error.tsx`.
 */
export async function selectHandle(
  _prevState: HandleFormState,
  formData: FormData,
): Promise<HandleFormState> {
  const user = await requireUser();

  const limit = rateLimit(
    await clientKey("handle"),
    SUBMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    return { error: TOO_MANY_ATTEMPTS };
  }

  const raw = formData.get("handle");
  const parsed = handleSchema.safeParse(typeof raw === "string" ? raw : "");
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid username";
    return { fieldErrors: { handle: [message] } };
  }
  const handle = parsed.data;

  await dbConnect();

  // Identity comes from the session, never the client (`docs/auth.md` §4).
  const taken = await User.exists({ handle, _id: { $ne: user.id } });
  if (taken) {
    return { fieldErrors: { handle: ["That username is taken"] } };
  }

  try {
    await User.updateOne({ _id: user.id }, { $set: { handle } });
  } catch (error) {
    // The sparse-unique index is the last line of defense against a race.
    if (isDuplicateKeyError(error)) {
      return { fieldErrors: { handle: ["That username is taken"] } };
    }
    throw error;
  }

  // Propagate the new handle onto the JWT so the proxy gate and UI stop seeing
  // `handle: null` (Auth.js v5 `update` → `jwt` callback with trigger "update").
  await updateSession({ user: { handle } });

  revalidatePath("/", "layout");
  redirect(POST_ONBOARDING_REDIRECT);
}

/**
 * Live availability check for the onboarding input. Does the format/reserved
 * checks for free and only hits the DB for a well-formed, unreserved handle.
 */
export async function checkHandleAvailability(
  rawValue: string,
): Promise<HandleCheckResult> {
  const user = await requireUser();

  const value = (rawValue ?? "").trim().toLowerCase();
  if (value.length === 0) {
    return { status: "idle" };
  }
  if (value.length < HANDLE_MIN) {
    return { status: "too-short" };
  }
  if (RESERVED_HANDLES.has(value)) {
    return { status: "reserved" };
  }

  const parsed = handleSchema.safeParse(value);
  if (!parsed.success) {
    return { status: "invalid" };
  }

  const limit = rateLimit(
    await clientKey("handle-check"),
    CHECK_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    // Transient: let the client keep the previous state rather than mislabel.
    return { status: "checking" };
  }

  await dbConnect();
  const taken = await User.exists({
    handle: parsed.data,
    _id: { $ne: user.id },
  });
  return { status: taken ? "taken" : "available" };
}
