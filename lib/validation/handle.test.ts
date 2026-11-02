import { describe, expect, it } from "vitest";

import { HANDLE_MAX, RESERVED_HANDLES, handleSchema } from "@/lib/validation/handle";

describe("handleSchema", () => {
  it("accepts lowercase letters, digits, hyphens and underscores", () => {
    const result = handleSchema.safeParse("a_cool-user99");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("a_cool-user99");
    }
  });

  it("normalizes input: trims surrounding whitespace and lowercases", () => {
    const result = handleSchema.safeParse("  MyName  ");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("myname");
    }
  });

  it("accepts the minimum length of 3 characters", () => {
    expect(handleSchema.safeParse("abc").success).toBe(true);
  });

  it("accepts the maximum length of 30 characters", () => {
    const result = handleSchema.safeParse("a".repeat(HANDLE_MAX));

    expect(result.success).toBe(true);
  });

  it("rejects a handle shorter than 3 characters", () => {
    const result = handleSchema.safeParse("ab");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Username must be at least 3 characters",
      );
    }
  });

  it("rejects a blank handle as too short (after trimming)", () => {
    const result = handleSchema.safeParse("   ");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Username must be at least 3 characters",
      );
    }
  });

  it("rejects a handle longer than 30 characters", () => {
    const result = handleSchema.safeParse("a".repeat(HANDLE_MAX + 1));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Username must be at most 30 characters",
      );
    }
  });

  it("rejects a dot (not in the allowed charset)", () => {
    const result = handleSchema.safeParse("john.doe");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Use only lowercase letters, numbers, hyphens and underscores",
      );
    }
  });

  it("rejects internal whitespace", () => {
    const result = handleSchema.safeParse("john doe");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Use only lowercase letters, numbers, hyphens and underscores",
      );
    }
  });

  it("rejects other symbols", () => {
    expect(handleSchema.safeParse("john!").success).toBe(false);
    expect(handleSchema.safeParse("john@doe").success).toBe(false);
    expect(handleSchema.safeParse("💥fire").success).toBe(false);
  });

  it("rejects a reserved handle with the unavailable message", () => {
    const result = handleSchema.safeParse("admin");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("That username isn't available");
    }
  });

  it("rejects a reserved handle regardless of casing/whitespace", () => {
    // Normalization runs before the reserved check.
    const result = handleSchema.safeParse("  Admin ");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("That username isn't available");
    }
  });

  it("rejects every configured reserved handle", () => {
    for (const reserved of RESERVED_HANDLES) {
      const result = handleSchema.safeParse(reserved);
      expect(result.success).toBe(false);
    }
  });

  it("rejects a non-string value", () => {
    expect(handleSchema.safeParse(123).success).toBe(false);
    expect(handleSchema.safeParse(null).success).toBe(false);
    expect(handleSchema.safeParse(undefined).success).toBe(false);
  });
});
