import { afterEach, describe, expect, it, vi } from "vitest";

import { rateLimit } from "@/lib/auth/rate-limit";

/**
 * `rateLimit` keeps per-key state in a module-level Map, so each test uses a
 * unique key to stay independent of every other test (no shared state, no
 * ordering assumptions). Tests that manipulate the clock restore real timers
 * in `afterEach`.
 */
afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows the first request for a key", () => {
    const result = rateLimit("first-request", 3, 60_000);

    expect(result).toEqual({ ok: true, retryAfterMs: 0 });
  });

  it("allows requests up to the limit", () => {
    const key = "under-limit";

    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const key = "over-limit";

    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const blocked = rateLimit(key, 2, 60_000);

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("reports retryAfterMs as the time left in the window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const key = "retry-after";

    rateLimit(key, 1, 60_000); // opens the window at t=0, resets at t=60_000
    vi.setSystemTime(10_000); // 10s later
    const blocked = rateLimit(key, 1, 60_000);

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBe(50_000);
  });

  it("resets and allows again once the window has elapsed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const key = "window-reset";

    rateLimit(key, 1, 60_000);
    expect(rateLimit(key, 1, 60_000).ok).toBe(false);

    vi.setSystemTime(60_000); // window boundary reached (resetAt <= now)
    const afterReset = rateLimit(key, 1, 60_000);

    expect(afterReset).toEqual({ ok: true, retryAfterMs: 0 });
  });

  it("tracks separate keys independently", () => {
    const allowed = rateLimit("key-a", 1, 60_000);
    rateLimit("key-b", 1, 60_000);
    const blockedB = rateLimit("key-b", 1, 60_000);
    const stillAllowedFreshKey = rateLimit("key-c", 1, 60_000);

    expect(allowed.ok).toBe(true);
    expect(blockedB.ok).toBe(false);
    expect(stillAllowedFreshKey.ok).toBe(true);
  });
});
