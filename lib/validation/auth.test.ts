import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "@/lib/validation/auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    });

    expect(result.success).toBe(true);
  });

  it("normalizes the email: trims surrounding whitespace and lowercases", () => {
    const result = loginSchema.safeParse({
      email: "  User@Example.COM  ",
      password: "anything",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "anything",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Enter a valid email address");
    }
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password is required");
    }
  });

  it("rejects a missing email field", () => {
    const result = loginSchema.safeParse({ password: "anything" });

    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts a valid email and an 8-character password", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a password at the 72-character bcrypt boundary", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(72),
    });

    expect(result.success).toBe(true);
  });

  it("normalizes the email the same way as login", () => {
    const result = signupSchema.safeParse({
      email: "  New.User@Example.COM  ",
      password: "12345678",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("new.user@example.com");
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "1234567",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 8 characters",
      );
    }
  });

  it("rejects a password longer than 72 characters", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(73),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at most 72 characters",
      );
    }
  });

  it("rejects a malformed email", () => {
    const result = signupSchema.safeParse({
      email: "nope",
      password: "12345678",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Enter a valid email address");
    }
  });
});
