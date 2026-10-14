# Linkbase — Security

Where secrets live, what headers the app ships, how abuse is throttled, and how untrusted content is rendered.

**Authorization — who may read or write which document — is not in this doc.** The four enforcement layers (`requireUser()`, the dashboard layout guard, the query scoping by `userId`) live in `auth.md` and `database.md`. This doc covers the four surfaces around them.

| Surface | The risk | Covered in |
|---------|----------|------------|
| Secrets | A credential reaches the repo or the client bundle | [Secrets & environment variables](#secrets--environment-variables) |
| Response headers | Clickjacking, XSS, referrer leakage | [Security headers](#security-headers) |
| Abuse | Brute force, spam, scraping | [Rate limiting](#rate-limiting) |
| Rendered content | Stored XSS from a link URL or title | [Untrusted content](#untrusted-content) |

**Current state:** `next.config.ts` has **no `headers()` function** — nothing below is configured yet. No rate-limit library is installed, `src/lib/rate-limit.ts` does not exist, and the app has no `.env.example`. Zod is not installed either (`errors-and-validation.md`).

---

## Secrets & environment variables

**A secret lives in an environment variable. Never in code, never in the repo, never in a commit message or a log line.** A key pasted into a source file is one `git push` from being public, and one build away from being in the client bundle.

| File | Committed? | Holds |
|------|-----------|-------|
| `.env.local` | **No** — gitignored | Real local values: DB URI, `AUTH_SECRET`, provider keys |
| `.env.example` | **Yes** — the template | Every variable name, with placeholder values, no real secrets |
| `.env` | No — avoid | Ambiguous, and easy to commit by accident |

`.env.example` is the contract: it lists every variable the app reads with safe placeholders (`MONGODB_URI=mongodb://localhost:27017/linkbase`, `AUTH_SECRET=replace-me`). A new contributor copies it to `.env.local` and fills in real values. When you add a variable, add it to `.env.example` in the same change.

### The current `.gitignore` ignores `.env.example` too

The pattern in `.gitignore` is `.env*`, which matches **the template as well as the real file**:

```
$ git check-ignore -v .env.example
.gitignore:34:.env*	.env.example
```

So `.env.example` cannot be committed today — the second half of the rule above silently fails. Add a negation **after** the existing pattern (order matters; a later rule wins):

```gitignore
# env files — real values stay untracked, the template is committed
.env*
!.env.example
```

Then verify with `git check-ignore -v .env.example` — it must print nothing.

### `NEXT_PUBLIC_` is a publish, not a prefix

Next's production checklist: *"only public variables are prefixed with `NEXT_PUBLIC_`."* The prefix **inlines the value into the client bundle at build time.** It is not access control and it cannot be revoked — anyone can read it in the shipped JavaScript.

- **Server-only secrets get no prefix.** `MONGODB_URI`, `AUTH_SECRET`, and provider secret keys are read only in server code.
- **A `NEXT_PUBLIC_` variable is public by definition.** Only things you would publish anyway (a public site URL, a publishable analytics id) belong there.
- **A secret can also leak without the prefix** — by passing it as a prop into a Client Component, where it is serialized into the RSC payload and reaches the browser. Secrets stay on the server side of the boundary.

### Validate once, at startup

Env vars are parsed once with a Zod schema in **`src/lib/env.ts`** and the process fails fast on a missing or malformed value — an app that boots with `AUTH_SECRET` undefined is worse than one that refuses to boot. `errors-and-validation.md` owns that rule; the security-relevant part is **the module is `import "server-only"`**, so importing it from a Client Component is a build error rather than a leak.

**Never log a secret.** `errors-and-validation.md` already excludes tokens, session cookies, and passwords from error context; add connection strings and API keys to that list. Log the variable *name* that is missing, never its value.

---

## Security headers

Set in **`next.config.ts`** via its `headers()` function. (Next's own docs show `next.config.js`; this project is TypeScript, and the file is `next.config.ts`.)

```ts
// next.config.ts
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Header values must be one line — a raw template literal carries newlines
// that make the header invalid. Collapse whitespace before sending it.
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

Keep the existing `cacheComponents`, `partialPrefetching`, and `turbopack` keys — `headers()` is additive.

### The three you asked for, and what each buys

| Header | Value | Stops |
|--------|-------|-------|
| `Content-Security-Policy` | see above | Loading scripts, styles, frames from anywhere but this origin — the main XSS backstop |
| `X-Frame-Options` | `DENY` | Linkbase being framed. Clickjacking — a transparent iframe over the "delete link" button |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Leaking full URLs (with query strings and handles) to third parties. Sends only the origin cross-site, and nothing on an HTTPS→HTTP downgrade |

The other three are cheap and worth having: `nosniff` stops MIME-sniffing a download into something executable, HSTS forces HTTPS before the first redirect can be intercepted, and `Permissions-Policy` denies device APIs this app never uses.

### Two things about these headers

**`X-Frame-Options` is superseded by CSP's `frame-ancestors`.** Next's docs say so directly, and the two are set here to the same end: `DENY` and `'none'` mean the same thing. Keep both — modern browsers honour `frame-ancestors` and ignore `X-Frame-Options`, while older ones do the reverse. If Linkbase ever ships an embeddable profile badge, both must be relaxed together, and `DENY`/`'none'` are what break it.

**`Referrer-Policy` is a real choice for this app, not a default.** Linkbase's whole surface is outbound links, so every click sends a referrer to a third party. `strict-origin-when-cross-origin` sends `https://linkbase.to` and drops the profile path — the destination learns Linkbase sent them, not which user. `origin-when-cross-origin` (the value Next's docs quote) drops the downgrade protection; `no-referrer` breaks destination analytics that partners may rely on.

### Why the CSP allows `'unsafe-inline'`

`script-src 'unsafe-inline'` is the weak point of a config-level CSP, and it is deliberate here. The alternative is a per-request **nonce** generated in `src/proxy.ts`, which forbids `'unsafe-inline'` entirely. Next's docs are explicit about what that costs:

> **"Partial Prerendering (PPR) is incompatible with nonce-based CSP since static shell scripts won't have access to the nonce"** — and nonces require dynamic rendering for **every** page, disabling static optimization and CDN caching.

This project enables `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`. A nonce CSP would dismantle exactly those features. The config-level policy is the one that fits the architecture; the nonce path is recorded in **TBD** with its tradeoff rather than adopted silently.

`'unsafe-eval'` is added in development only — React uses `eval` there to reconstruct server-side error stacks. **Neither React nor Next uses `eval` in production**, so the flag must not follow the build there. That is what the `isDev` ternary is for.

**A CSP is a backstop, not the fix.** It limits the damage of an injection; it does not prevent one. The escaping rules below are the actual defence, and a policy loose enough to allow `'unsafe-inline'` will not catch a determined injection on its own.

**Verify it, don't assume it.** `curl -I http://localhost:3000` should show all six headers on the response. A header set here can still be overridden by whatever sits in front of the app — a host or CDN that sets its own `Content-Security-Policy` wins, or combines with yours into a policy stricter than either.

---

## Rate limiting

Two surfaces are abused in practice, and they need different keys.

| Target | Keyed by | Proposed limit | Stops |
|---------|----------|----------------|-------|
| Sign-in | IP **and** the submitted email | 5 / 15 min each | Password brute force, credential stuffing |
| Link creation | the **session `userId`** | 30 / hour | Spam links, unbounded DB growth |
| Public profile | IP | 60 / min | Scraping, hotlinking (`auth.md` flags this route) |

**These numbers are starting points, not sourced from anywhere** — tune them against real traffic. What matters now is the shape.

The following official pattern keeps the check in one place, `src/lib/rate-limit.ts`:

```ts
// src/lib/rate-limit.ts
import "server-only";

export async function checkRateLimit(request: Request) {
  // ...counter keyed by IP + identifier, in a shared store
  return { rateLimited: false, retryAfter: 0 };
}
```

Return **429** with a `Retry-After` header when it trips — the status is what clients, browsers, and hosts understand.

### Where the check goes

**Sign-in is not a Server Action**, so it cannot follow the action pattern below. `auth.md` puts sign-in behind the NextAuth handler at `/api/auth/*`, and `routing.md` notes `/api` is excluded from the proxy matcher and sits outside every protection layer. **Put the sign-in check where the credential is verified** — NextAuth's `authorize`/`signIn` callback — not in `src/proxy.ts`, which sees only the session cookie and never runs for those paths.

**Link creation is a Server Action**, so the check runs inside it, in this order:

1. **`requireUser()`** — first, so the rate-limit key is the server-derived `userId`. A key taken from a form field or header is attacker-controlled and worthless: an abuser rotates the key and the limit never trips.
2. **`checkRateLimit()`** — before validation and the database, so an abusive caller does the least possible work.
3. Validate, then touch the database (`errors-and-validation.md`).

```ts
// src/app/(dashboard)/add-links/actions.ts
"use server";

import { requireUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function createLink(prevState: ActionState, formData: FormData) {
  const user = await requireUser();          // identity first — the key depends on it
  const { rateLimited } = await checkRateLimit(user.id);
  if (rateLimited) return { status: "error", formError: "Too many links. Try again later." };
  // ...validate, then write
}
```

**Rate limiting is not authorization and not validation.** It never replaces `requireUser()`, the `userId` scoping, or the schema — it only bounds how often a legitimate-looking caller can ask.

### Two honesty notes about the store

- **In-memory counters do not work on more than one instance.** A `Map` in module scope is per-process: behind a load balancer each instance keeps its own count, and every deploy resets them all. Fine for local development, useless as a control in production. If a real limit is needed, it needs a shared store (Redis, or a Mongo collection with a TTL index) — and that store becomes a dependency on the sign-in path, so it must fail *open* or *closed* deliberately, not by accident.
- **Do not rate-limit by making the failure visible.** A sign-in check that answers "too many attempts for *this email*" and one that answers "wrong password" both leak whether an account exists. Return the same generic failure for a rate-limited attempt as for a bad password, and keep the counting server-side.

Also enable whatever rate limiting the host provides. An application-level counter that never sees traffic dropped at the edge is a second line, not the first.

---

## Untrusted content

Everything a user types — a link `title`, a link `url`, a profile `handle` and bio — is untrusted and rendered on a public page. Two separate problems: what React does for you, and the one thing it cannot.

### React escapes text by default

`{link.title}` and `{link.url}` in JSX are **escaped automatically**. A title of `<img src=x onerror=alert(1)>` renders as those literal characters, not as an element. No manual escaping, no HTML-entity encoding, and **no sanitizer belongs on this path.**

| What you write | Rendered as | Safe? |
|---|---|---|
| `<a>{link.title}</a>` | Escaped text | **Yes** — the default, and all a title needs |
| `<a title={link.title}>` | Escaped attribute | **Yes** |
| `<div dangerouslySetInnerHTML={{ __html: link.title }} />` | Parsed as HTML | **No** — this is the entire vulnerability |

**Do not reach for `dangerouslySetInnerHTML`.** If rich text in a bio is ever a real requirement, it needs a dedicated sanitizer (DOMPurify) at the render boundary and a decision recorded here — not a hand-rolled regex.

### The `javascript:` URL — the real hole in a link app

This is the one that matters for Linkbase, and React's escaping does not cover it. A URL is not text — it lands in an `href`, and the browser *executes* certain schemes.

**`z.url()` alone does not prevent this.** It validates that the string parses as a URL, and `javascript:alert(document.cookie)` parses fine. So a user submits it as a link, it is stored, and it executes in every visitor's browser on the public profile: **stored XSS, from a field that passed validation.**

Block it with a protocol allowlist, added to the link schema in `src/lib/validation/link.ts`:

```ts
// src/lib/validation/link.ts
import { z } from "zod";

const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export const createLinkSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  url: z
    .url({ message: "Enter a valid URL" })
    .refine((value) => SAFE_PROTOCOLS.has(new URL(value).protocol), {
      message: "Only http and https links are allowed",
    }),
});
```

**Parse the URL and read its protocol; do not string-match the input.** `startsWith("javascript:")` is bypassed by a leading tab, a newline, or mixed case — while `new URL()` normalises all of those before `.protocol` is read, which is why the check above is on the parsed value. The same allowlist rejects `data:`, `vbscript:`, and `file:`.

Validate the protocol **on write** (above, so nothing bad is ever stored) and treat any URL already in the database as unverified until re-checked.

### `rel="noopener noreferrer"` on every outbound link

Linkbase's links open in a new tab. That needs two attributes, not one:

```tsx
<a href={link.url} target="_blank" rel="noopener noreferrer">
  {link.title}
</a>
```

- **`noopener`** — the opened page gets `null` for `window.opener`, so it cannot reach back and navigate *your* tab. Without it, a link to a malicious page can silently turn the Linkbase tab into a phishing copy of Linkbase.
- **`noreferrer`** — also drops the `Referer` header. It implies `noopener` in every browser that supports it, which is why they are written together rather than as a choice.

Modern browsers imply `noopener` for `target="_blank"` on their own. **Write it anyway** — it costs nothing, covers older browsers, and makes the requirement visible in the JSX rather than depending on a browser default. The `Button` component in `ui.md` takes `as="a"`; when it renders a link, the same attributes apply.

**Internal links are the opposite case** — `next/link` to `/dashboard` or `/user/[handle]` needs neither `target="_blank"` nor `rel`; it navigates the same tab and Next handles it.

### Two adjacent traps

- **JSON-LD / `dangerouslySetInnerHTML` for structured data.** A link title injected into a JSON-LD block via `dangerouslySetInnerHTML` can contain `</script>` and break out of the tag — escaping does not apply inside a `dangerouslySetInnerHTML` context. If structured data is added for SEO, escape the serialized output (`JSON.stringify(data).replace(/</g, "\\u003c")`), and for a public profile page the same care applies to any user-controlled value in `<script type="application/ld+json">`.
- **Unicode in titles and handles.** Bidi overrides (U+202E) can make a link title render reversed and disguise where it points. For a link app, a title that displays differently from the URL it opens is a phishing vector worth normalising, not a cosmetic issue.

---

## TBD

- **CSP strategy.** Config-level with `'unsafe-inline'` today. The nonce path in `src/proxy.ts` is strictly stronger, and incompatible with the `cacheComponents` + `partialPrefetching` setup — revisit only if the caching architecture changes, or if SRI (experimental, App Router only, preserves static generation) proves viable.
- **CSP reporting.** `report-uri` / `Reporting-Endpoints` so violations are visible instead of silent.
- **Rate-limit store and final numbers.** The limits above are proposals. Redis vs a Mongo TTL collection is undecided, as is the fail-open vs fail-closed behaviour when the store is unreachable.
- **Where sign-in throttling attaches.** Depends on the provider choice (`auth.md` TBD) — `authorize` vs `signIn` callback differ by provider.
- **SSRF in link previews.** If links ever get fetched for `og:image`/favicon, the user supplies the URL the *server* requests — a link to `http://169.254.169.254/` or `http://localhost:27017` becomes an internal request from inside the network. Needs an address allowlist and redirect limits before that feature ships.
- **Secret rotation and deployment.** How `AUTH_SECRET` and provider keys are stored per environment, how they rotate, and what breaks when they do.
- **Dependency and supply-chain hygiene.** `npm audit` in CI, Dependabot, and a lockfile-committed policy.
- **Abuse on public surfaces.** Bot protection on sign-up, and reporting/takedown for a public profile hosting malicious links.
- **`X-Frame-Options` vs an embeddable badge.** `DENY` is correct now; revisit if profiles are ever meant to be iframed, which requires relaxing it and `frame-ancestors` together.

**Reference:** Next's bundled guides — `01-app/02-guides/content-security-policy.md`, `01-app/02-guides/data-security.md`, `01-app/02-guides/production-checklist.md`, `01-app/03-api-reference/05-config/01-next-config-js/headers.md`.
