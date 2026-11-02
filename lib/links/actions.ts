"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/auth/rate-limit";
import { dbConnect } from "@/lib/db";
import { Link } from "@/lib/db/models/link";
import type { LinkFormState } from "@/lib/links/types";
import { linkIdSchema, linkSchema } from "@/lib/validation/link";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const TOO_MANY_ATTEMPTS =
  "Too many attempts. Please wait a minute and try again.";
const NOT_FOUND = "That link no longer exists.";

async function clientKey(scope: string): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

function parseFields(formData: FormData) {
  return linkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
  });
}

/**
 * Create a link for the signed-in user. Fixed order (`docs/data-mutations.md`
 * §2): session → rate limit → validate → scope to `userId` → write → revalidate.
 * Expected failures are returned inline; only unexpected errors throw.
 */
export async function createLink(
  _prevState: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const user = await requireUser();

  const limit = rateLimit(
    await clientKey("link-create"),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    return { error: TOO_MANY_ATTEMPTS };
  }

  const parsed = parseFields(formData);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { fieldErrors };
  }

  await dbConnect();
  await Link.create({ userId: user.id, ...parsed.data });

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Update one of the signed-in user's links. The `{ _id, userId }` filter is the
 * ownership check — a user can never edit another user's link.
 */
export async function updateLink(
  _prevState: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const user = await requireUser();

  const limit = rateLimit(
    await clientKey("link-update"),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    return { error: TOO_MANY_ATTEMPTS };
  }

  const id = linkIdSchema.safeParse(formData.get("id"));
  if (!id.success) {
    return { error: NOT_FOUND };
  }

  const parsed = parseFields(formData);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { fieldErrors };
  }

  await dbConnect();
  const result = await Link.updateOne(
    { _id: id.data, userId: user.id },
    { $set: parsed.data },
  );
  if (result.matchedCount === 0) {
    return { error: NOT_FOUND };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Delete one of the signed-in user's links. Scoped by `{ _id, userId }` so it
 * can only remove the caller's own link.
 */
export async function deleteLink(
  _prevState: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const user = await requireUser();

  const limit = rateLimit(
    await clientKey("link-delete"),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    return { error: TOO_MANY_ATTEMPTS };
  }

  const id = linkIdSchema.safeParse(formData.get("id"));
  if (!id.success) {
    return { error: NOT_FOUND };
  }

  await dbConnect();
  await Link.deleteOne({ _id: id.data, userId: user.id });

  revalidatePath("/dashboard");
  return { ok: true };
}
