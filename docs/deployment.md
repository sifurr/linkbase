# Linkbase — Deployment

How Linkbase ships: a GitHub Actions CI/CD pipeline that runs every check inside a Docker container for a reproducible build, then deploys to Vercel — preview builds for pull requests, production on merge to `main`. Read this before changing the pipeline, adding a deploy environment variable, touching the production database connection, or altering the required checks.

> **Where this lives:** the pipeline is `.github/workflows/ci.yml`, the production container image is `Dockerfile` (+ `.dockerignore`), and `next.config.ts` sets `output: "standalone"` for that image. Keep all of these in sync with this doc, and commit pipeline changes on their own `chore/` branch (see [`git-conventions.md`](git-conventions.md)).

---

## 1. Deployment model

- **CI/CD runs in GitHub Actions.** One workflow handles both flows, triggered on pull requests targeting `main` and on pushes to `main`.
- **Every CI job runs inside a pinned Docker container** (`node:22-bookworm`) so CI matches local and production: a fixed Node version and `npm ci` against the committed `package-lock.json`. No "works on my machine" drift between a developer's box and the runner.
- **Vercel hosts the app.** The build output is produced in CI with the Vercel CLI (`vercel build`) and uploaded with `vercel deploy --prebuilt`, so **source is never built on Vercel's side** — the runner is the single source of truth for what gets deployed.
- **Two flows, one rule:** nothing deploys until the required checks (§3) pass. Preview and production differ only in which Vercel environment they target.

```
PR opened/updated ─▶ checks (Docker) ─▶ vercel build        ─▶ vercel deploy --prebuilt         ─▶ Preview URL
merge to main     ─▶ checks (Docker) ─▶ vercel build --prod ─▶ vercel deploy --prebuilt --prod  ─▶ Production
```

## 2. Docker: CI environment and production image

Docker appears in two distinct, deliberate places.

**The CI container.** Every workflow job runs inside `node:22-bookworm` (the `container:` key in `ci.yml`). This pins Node and ships `git` (which `actions/checkout` needs), giving the checks and the Vercel build one reproducible environment. **Vercel builds from the prebuilt output the runner produces (`vercel build` → `vercel deploy --prebuilt`) — it never builds from a Docker image.** Keep this image's Node major in lockstep with the `Dockerfile` base.

**The production `Dockerfile`.** A multi-stage, production-ready image for running the app as a container anywhere *other* than Vercel (self-hosting, local production parity). It relies on Next.js **standalone output** (`output: "standalone"` in `next.config.ts`):

- **`deps` → `builder` → `runner` stages.** `deps` runs `npm ci` against the lockfile (cached by a BuildKit mount); `builder` runs `npm run build`; `runner` carries only `.next/standalone`, `.next/static`, and `public`.
- **Pinned base** — `node:22-bookworm-slim` via a `NODE_VERSION` build arg; update it deliberately, never float on `latest`.
- **Non-root runtime** — runs as the image's unprivileged `node` user, exposes `3000`, starts `node server.js`.
- **No secrets baked in** — `.dockerignore` excludes every `.env*` file; no secrets are passed as build args. This app has no `NEXT_PUBLIC_*` vars, so nothing sensitive is inlined at build time. Runtime secrets (§6) are supplied to the container at run time.

Build and run it locally with:

```bash
docker build -t linkbase .
docker run --rm -p 3000:3000 \
  -e MONGODB_URI="..." -e AUTH_SECRET="..." -e AUTH_URL="http://localhost:3000" \
  linkbase
```

## 3. Checks that must pass before any deploy

Both flows run these first. **A failing check blocks the deploy** — this is enforced in the workflow (deploy jobs declare `needs: [checks]`) and by a branch protection rule on `main` that requires the checks to be green before a PR can merge.

| Check | Command | What it guards |
| --- | --- | --- |
| **Lint** | `npm run lint` | `eslint-config-next` (core-web-vitals + TypeScript) rules |
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | TypeScript strict-mode correctness ([`coding-standards.md`](coding-standards.md)) |
| **Unit tests** | `npm run test` | Vitest tests for pure functions and Zod schemas ([`testing.md`](testing.md)) |

- **Unit tests only** run in CI. End-to-end QA is Playwright MCP driven through the `run-qa-suite` skill against a local test database and is **not** part of the automated pipeline (see [`testing.md`](testing.md)); run it manually before merging changes that touch Server Actions or data flows.
- Unit tests need **no database** — they cover pure logic, so CI never connects to MongoDB. The pipeline does not provision `MONGODB_URI`/`MONGODB_URI_TEST` for the checks job.
- Keep the check commands here identical to the scripts in `package.json` so local `npm run lint && npm run typecheck && npm run test` reproduces CI exactly.

## 4. Preview flow (pull requests)

When a PR targeting `main` is opened, synchronized, or reopened, the workflow builds a **preview** deployment so changes can be tested in isolation on a real URL before merge.

1. Check out the code and run the §3 checks in the Docker image.
2. Pull the preview environment config from Vercel:
   ```bash
   vercel pull --yes --environment=preview --token="$VERCEL_TOKEN"
   ```
3. Build the project in CI (no `--prod`):
   ```bash
   vercel build --token="$VERCEL_TOKEN"
   ```
4. Upload the prebuilt output as a preview deployment:
   ```bash
   vercel deploy --prebuilt --token="$VERCEL_TOKEN"
   ```
5. The command prints a unique preview URL; surface it on the PR (a job summary or a PR comment) so reviewers and the author can click through.

Each push to the PR produces a fresh preview, so the review always reflects the latest commit. Preview deployments use the **Preview** environment's variables (§6) — never production secrets or the production database.

## 5. Production flow (merge to `main`)

A merge to `main` (one PR, human-reviewed — see [`git-conventions.md`](git-conventions.md)) triggers the production deploy. Production never deploys from a feature branch, and never skips §3.

1. Check out `main` and run the §3 checks in the Docker image.
2. Pull the production environment config:
   ```bash
   vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
   ```
3. Build for production:
   ```bash
   vercel build --prod --token="$VERCEL_TOKEN"
   ```
4. Deploy the prebuilt output to production:
   ```bash
   vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
   ```

Gate the deploy job on a GitHub **`production` environment** so the production secrets are scoped to it, and optionally add **required reviewers** on that environment for a final human approval before the production deploy runs. If a deploy needs to be undone, use Vercel's **instant rollback** to the previous production deployment rather than forcing a revert through the pipeline.

## 6. Environment variables & secrets

Secrets live in environment variables only — never in source, never in the repo, never in image layers (see [`security.md`](security.md) §1). There are two distinct stores:

**Vercel — runtime variables (what the app reads when it runs).**
Set these per environment in the Vercel project (**Production**, **Preview**, and **Development**). `vercel pull` fetches them into CI for the build. The app's variables:

- **`MONGODB_URI`** — the Atlas connection string, with **different values per environment** (a production cluster for Production, a separate non-production database for Preview — never point previews at production data). See §7.
- **`AUTH_SECRET`** — the NextAuth/Auth.js secret for signing session JWTs and cookies. **Generate a distinct value per environment** (`npx auth secret`); never reuse the local one.
- **`AUTH_URL`** — the canonical app URL. Set it explicitly in Production (the production domain). For previews, Auth.js can derive it from the deployment; set it only if a flow needs a fixed URL.

Mirror every required variable in **`.env.example`** with a placeholder when you add it, so the template stays complete (see [`security.md`](security.md)).

**GitHub Actions — pipeline secrets (what the workflow needs to deploy).**
Store these as **GitHub repository (or `production` environment) secrets**, referenced in the workflow as `${{ secrets.NAME }}` — never printed to logs:

- **`VERCEL_TOKEN`** — a Vercel access token that authorizes the CLI from CI.
- **`VERCEL_ORG_ID`** and **`VERCEL_PROJECT_ID`** — identify the Vercel team and project so the CLI deploys without interactive project linking.

Scope the production-only secrets to the GitHub `production` environment (§5) so pull-request runs from the preview flow can't reach them.

## 7. MongoDB Atlas (production connection)

The production database is a **MongoDB Atlas** cluster, reached through the same `MONGODB_URI` the app always reads (Mongoose; single cached connection — see [`database.md`](database.md)).

- **Connection string** — a `mongodb+srv://` SRV URI with the database name in the path and `retryWrites=true&w=majority`, e.g.
  `mongodb+srv://<user>:<password>@<cluster>/linkbase?retryWrites=true&w=majority`.
  It is set as the **Production** `MONGODB_URI` in Vercel (§6) and **never committed**.
- **Least-privilege credentials** — use a dedicated Atlas database user scoped to the Linkbase database with only the permissions the app needs; do not reuse an admin user. Rotate the password if it's ever exposed (rotating means updating the Vercel Production variable and redeploying).
- **Network access** — Atlas denies connections by default. Because Vercel's serverless functions use dynamic egress IPs, allow access either via Vercel's **static egress IPs** added to the Atlas IP access list, or via a private networking integration. Avoid a permanent `0.0.0.0/0` allow-all entry in production.
- **Separate databases per environment** — Production, Preview, and local/QA each use their own database so a preview or a test run can never read or mutate production data ([`testing.md`](testing.md), [`security.md`](security.md)).

## 8. Reliability & security practices

- **No deploy without green checks.** Enforced by `needs:` in the workflow and branch protection on `main` — not by convention alone.
- **Reproducible builds.** Docker base image and Node version pinned; `npm ci` against the committed lockfile; the artifact that passed CI is the artifact that deploys (`--prebuilt`), so the build is never re-run on Vercel.
- **Preview isolation.** Previews use preview-scoped secrets and a non-production database; production secrets are confined to the GitHub `production` environment.
- **Least privilege everywhere.** Scoped Atlas user, scoped Vercel token, per-environment `AUTH_SECRET`.
- **Secrets never surface.** Not in source, not in image layers, not in build args, not in CI logs — only as runtime/pipeline environment variables.
- **Recoverability.** Prefer Vercel instant rollback to undo a bad production deploy; keep `main` always deployable so the previous good state is one click away.
- **Headers at the edge.** The baseline security headers in `next.config.ts` ship with every deployment (see [`security.md`](security.md) §2); the full CSP remains a deliberate follow-up there.

## 9. First-time setup (one-time)

Do this once to make the pipeline live:

1. **Link the Vercel project** locally to get its IDs:
   ```bash
   npx vercel link        # select the team + project
   cat .vercel/project.json   # prints "orgId" and "projectId"
   ```
   (`.vercel` is gitignored — never commit it.)
2. **Create a Vercel token** at **Vercel → Account Settings → Tokens**, scoped to the team.
3. **Add GitHub repository secrets** (**Settings → Secrets and variables → Actions**):
   `VERCEL_TOKEN`, `VERCEL_ORG_ID` (the `orgId`), `VERCEL_PROJECT_ID` (the `projectId`).
4. **Set the app's runtime variables in Vercel** for each environment (§6): `MONGODB_URI`, `AUTH_SECRET`, `AUTH_URL`.
5. **Protect `main`** (**Settings → Branches**): require the **`Lint, typecheck & test`** status check and a pull-request review before merge ([`git-conventions.md`](git-conventions.md)).
6. **Create a GitHub `production` environment** (**Settings → Environments**) and, optionally, add required reviewers for a final approval gate on production deploys (§5).

After this, opening a PR produces a preview URL and merging to `main` deploys production — both only when the checks pass.
