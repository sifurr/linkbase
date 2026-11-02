import "server-only";

/**
 * Minimal fixed-window rate limiter (`docs/security.md` §3), used to cap
 * sign-in and sign-up attempts.
 *
 * State is in-memory and therefore per-instance: it resets on redeploy and is
 * not shared across serverless instances. That is enough to blunt casual
 * brute-forcing; a durable store (e.g. Redis/Upstash) is the follow-up when the
 * app runs multi-instance.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

type RateLimitResult = { ok: boolean; retryAfterMs: number };

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}
