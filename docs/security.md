# Linkbase — Security

Baseline security practices for Linkbase: where secrets live, the HTTP headers every response carries, rate limiting on abuse-prone endpoints, and how user-generated content is handled on render. Read this before adding a secret, touching headers, exposing a new endpoint, or rendering user content.

---

## 1. Secrets live in environment variables

Secrets (API keys, database URIs, auth providers' client secrets, the NextAuth secret) live **only in environment variables** — never hard-coded in source, never committed to the repo.

- **`.env.local`** holds real secrets for local development and is **gitignored**.
- **`.env.example`** is **checked in** as a template: every required variable listed with a placeholder or empty value, never a real one.
- When you add a new variable, add it to `.env.example` in the same change so the template stays complete.

## 2. Security headers

Security headers are set in **`next.config.ts`** (the repo uses the TypeScript config — see [`CLAUDE.md`](../CLAUDE.md)) via its `headers()` function, applied to all responses:

- **Content-Security-Policy (CSP)** — restricts the origins scripts, styles, and other resources may load from.
- **X-Frame-Options** — prevents the app from being framed (clickjacking defense).
- **Referrer-Policy** — limits referrer information leaked on outbound navigation.

## 3. Rate limiting

Abuse-prone endpoints are rate limited:

- **Sign-in attempts** — capped to slow credential-stuffing and brute-force attacks.
- **Link creation** — capped to stop spam and automated flooding.

## 4. User-generated content

Link URLs and titles are user-generated and treated as untrusted:

- **Escaped on render** — React escapes text by default; never bypass it (no `dangerouslySetInnerHTML`) for user content.
- **Outbound links** open with **`rel="noopener noreferrer"`** so the target page can't access `window.opener` or see the referrer.
