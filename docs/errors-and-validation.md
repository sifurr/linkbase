# Linkbase — Errors & Validation

How Linkbase validates input and handles the two kinds of failure: expected (bad input) and unexpected (bugs, outages). Read this before writing a Server Action or an error boundary.

---

## 1. Validate at the Server Action boundary

All input is validated with **Zod** at the **Server Action boundary** — before anything touches the database. An action parses its input first; nothing downstream runs on unvalidated data.

- Shared schemas live in **`lib/validation`**, reused across actions and (where useful) the client.
- The database is never the first line of defense — validation happens above it (see [`database.md`](database.md) for the schema-level guarantees underneath).

## 2. Validation errors are returned, not thrown

Bad input is an **expected** outcome, not an exception.

- A failed validation returns a **typed result object** the form renders **inline next to the offending fields**.
- These errors are **never thrown** — the action returns them so the UI can map them back to fields.

## 3. Unexpected errors are thrown

A real failure — a bug, a dropped connection — is **thrown**.

- It's caught by the **nearest `error.tsx`** (see [`routing.md`](routing.md) §4).
- It's **logged with enough context to debug** — what action ran, what it was doing, the underlying error.

## 4. Never leak internals to the client

- **No raw error messages or stack traces** reach the client.
- The client sees a safe, generic message; the detail stays in the server log.
