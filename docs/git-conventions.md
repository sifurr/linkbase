# Linkbase — Git Conventions

How commits are written, how branches are named, and how work reaches `main`.

The goal is one property: **`main` reads as a list of deliberate, typed changes.** Everything below serves that. A commit history you can scan is a history you can `git bisect`, review, and revert.

| Rule | Section |
|------|---------|
| Commits are typed and imperative | [Commit messages](#commit-messages) |
| One feature per branch, named by type | [Branches](#branches) |
| `main` only moves through a reviewed PR | [Pull requests](#pull-requests), [Protecting main](#protecting-main) |

**Current state:** the remote is `github.com/sifurr/linkbase`. Branch naming already follows this doc — `chore/claude-code-setup` is the current branch, 2 commits ahead of `main`. Commit messages do **not** yet: all four commits in the repo predate this convention.

On `main`:

| Commit | Message | Would be |
|--------|---------|----------|
| `0b16951` | `Initial commit from Create Next App` | `chore: scaffold Next.js app` |
| `a81cf49` | `Add CLAUDE.md with project guidance` | `docs: add CLAUDE.md project guidance` |

On `chore/claude-code-setup`:

| Commit | Message | Would be |
|--------|---------|----------|
| `a089051` | `Add project docs and a documentation convention to CLAUDE.md` | `docs: add project docs convention` |
| `5e21768` | `Add data-fetching guide and remaining project docs` | `docs: add data-fetching guide` |

**Do not rewrite that history to comply.** It is already pushed to a shared remote, and rewriting published commits on `main` costs more than the tidiness is worth. Apply the convention from the next commit forward.

Nothing enforces any of this yet: there is no `.github/` directory, no Git hooks, no `commitlint`, and no branch protection configured on the remote. The rules are conventions plus the [GitHub settings checklist](#protecting-main).

---

## Commit messages

**Conventional Commits: `<type>(<scope>): <subject>`** — a short, imperative subject.

```text
feat(add-links): add link creation form

The form posts to a Server Action so validation runs before the write.
Scope the insert by userId so a crafted request cannot write to another
account.

Closes #12
```

### Types

One vocabulary, used by both commits and branches. Pick the type that describes the **change**, not the file it touches.

| Type | Use for | Not for |
|------|---------|---------|
| `feat` | A new user-facing capability | Refactors that change no behaviour |
| `fix` | A bug fix | A change that was never working |
| `docs` | `docs/`, `README.md`, `CLAUDE.md`, comments | Code that happens to include a comment |
| `refactor` | Restructuring with behaviour unchanged | Anything that also fixes or adds |
| `test` | Test files and test config | — **reserved**, see below |
| `chore` | Dependencies, config, tooling, `AGENTS.md` regeneration | Anything a user would notice |

**`test` is currently unused.** `CLAUDE.md` records that no test runner or test files exist. The type is reserved so that the first test commit lands as `test:` rather than being misfiled as `chore:` or `feat:`.

**`docs` vs `chore`** is the common mix-up: editing `docs/*.md` is `docs`; editing `next.config.ts`, `.gitignore`, or `package.json` is `chore`.

### Scope

Optional, and worth it once a commit's area is not obvious from the subject. Use a **domain or route**, never a filename:

- `feat(add-links): …`, `fix(auth): …`, `refactor(db): …`, `docs(security): …`

`fix(src/lib/db/links.ts)` is not a scope — that is what the diff shows. `fix(db)` is.

### Subject line

| Rule | Good | Bad |
|------|------|-----|
| Imperative mood — it completes "*this commit will* …" | `add link creation form` | `added`, `adds`, `adding` |
| Lowercase after the colon | `fix(auth): handle expired session` | `fix(auth): Handle expired session` |
| No trailing period | `docs: add security doc` | `docs: add security doc.` |
| ~50 characters; hard limit 72 | `refactor(db): scope queries by userId` | `refactor(db): scope all the queries in the links and profiles collections by userId` |
| Describes the change, not the process | `feat: add profile page` | `feat: working on profile page` |

**"Fix bug" is not a subject.** Neither is "update stuff", "wip", or "address review comments" — say which bug, or what changed and why.

### Body and footers

- **A blank line between subject and body.** Without it, Git treats the body as part of the subject and the whole thing becomes one long line in `git log --oneline`.
- **The body explains *why*, not *what*.** The diff already shows what changed. Wrap at 72 characters.
- **One logical change per commit.** If the subject needs "and", it is probably two commits.
- **Trailers** go last, each `Key: value`:

```text
Closes #12
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

The `Co-Authored-By:` trailer is already in this repo's history — `a81cf49` carries the Claude Code line above. When work was produced with AI assistance, the trailer records it, so a reader knows the commit had a co-author without having to guess.

**Breaking changes** get `!` after the type/scope and a `BREAKING CHANGE:` footer, since `next.config.ts` and the Next 16 APIs move fast:

```text
feat(auth)!: require re-authentication on session expiry

BREAKING CHANGE: sessions no longer refresh silently; clients must
handle the redirect to /login.
```

---

## Branches

**`<type>/<short-kebab-description>`** — the same six types as commits, then what the branch does.

| Branch | For |
|--------|-----|
| `feat/add-links` | A new feature |
| `fix/session-redirect` | A bug fix |
| `docs/security` | Documentation work |
| `refactor/query-helpers` | Restructuring |
| `chore/bump-next` | Dependencies, config, tooling |

Lowercase, kebab-case, no spaces. Keep the description to a few words — it is a label, not a summary.

### The workflow

```bash
git switch main
git pull                      # branch from current main, not a stale one
git switch -c feat/add-links
# ... commits ...
git push -u origin feat/add-links
```

- **One feature per branch.** Unrelated work goes on its own branch, even a one-line fix — a branch that does two things cannot be reviewed or reverted as one.
- **Always branch from up-to-date `main`.** Branching from a stale local `main` is the usual cause of a PR that conflicts on arrival.
- **Branches are short-lived.** Merge, then delete. A long-running branch accumulates conflicts and drifts from the conventions its neighbours just adopted.
- **Never commit to `main`.** This includes "quick" fixes and typo corrections — they are `fix/…` and `docs/…` branches like anything else. There is no category of change small enough to skip the review step.

---

## Pull requests

**Every branch reaches `main` through a pull request.** Never merge locally and push to `main`; the PR is where the review happens, and it is the only record of why a change was accepted.

### The PR title becomes a commit on main

This is the load-bearing detail of the whole doc. Merging uses **squash and merge**, so the PR title is what lands on `main` as the commit subject.

**The PR title must therefore be Conventional Commits — the same rules as a commit subject**, including the imperative, lowercase-after-colon, no-trailing-period form. A PR titled `Add link form` becomes an untyped commit on `main` and breaks the convention at the only layer that matters.

```text
feat(add-links): add link creation form     ← PR title; becomes the commit on main
```

### Body

Keep it short and answer the reviewer's questions:

- **What changed** and **why** — the same reasoning a commit body would carry.
- **How it was verified.** With no test runner configured, this is what you actually ran: `npm run lint`, `npm run build`, or the manual steps you clicked through. "Tested locally" is not verification; say what you did.
- **Anything the reviewer should look at closely**, and any follow-up deliberately left out.

### Keeping the branch clean

Because the PR is squashed, **what happens *inside* the branch does not reach `main`** — intermediate `wip` and `fix typo` commits are collapsed away. Two consequences:

- **Do not merge `main` into your branch.** Rebase instead: `git fetch origin && git rebase origin/main`. A merge commit inside a squashed PR is discarded anyway, and it makes the branch's own history harder to follow.
- **The branch's own commits can be rough** — but the PR still gets a human review, so make the *final* state reviewable: no leftover debug logging, commented-out code, or unrelated edits.

### Review

**A human reviews and approves before merge.** The author does not merge their own unreviewed PR, and a passing `npm run build` is not a review — it says the code compiles, not that it belongs on `main`. Open a **draft PR** for early feedback on work in progress.

Before requesting review: `npm run lint` and `npm run build` both pass (`CLAUDE.md` lists the commands). There is no test command to run.

---

## Merging: squash and merge

| Strategy | What lands on `main` | Why not |
|----------|---------------------|---------|
| **Squash and merge** | **One typed commit per PR** | — this is the convention |
| Rebase and merge | Every branch commit, replayed | Requires a spotless branch; still lets `wip` through |
| Merge commit | A merge commit per PR | Noise, and the history stops reading as a list of changes |

```text
feat(add-links): add link creation form
fix(db): scope link queries by userId
```

### One GitHub gotcha

GitHub's squash message default is **"Pull request title and commit details"**, which appends a bulleted list of every commit on the branch to the body. A PR with five commits produces this on `main`:

```text
feat(add-links): add link creation form

* wip
* fix typo
* address review comments
```

That defeats the purpose — the mess you squashed is back, in the body. **Set the repo's squash default to "Pull request title"** (Settings → General → Pull Requests), and check the message box before confirming whenever it is not.

---

## Protecting main

**Nothing in this repository enforces the rules above.** Branch protection lives in GitHub's server-side settings, not in a file — so these are configuration steps, not code, and they must be repeated for any fork or new remote.

Settings → **Branches** → add a ruleset or branch protection rule targeting `main`:

- [ ] **Require a pull request before merging** — the only thing that actually stops a direct push to `main`
- [ ] **Require approvals: 1**
- [ ] **Dismiss stale approvals when new commits are pushed** — otherwise an approval survives the changes it was given for
- [ ] **Require conversation resolution before merging**
- [ ] **Do not allow bypassing the above settings** — include administrators, so the rules apply to you too
- [ ] **Block force pushes** and **block deletions**
- [ ] **Require status checks** — no checks exist yet, so this is empty until CI lands (see TBD)

> **A solo repository cannot satisfy "Require approvals: 1" on its own.** GitHub does not let you approve your own PR, so this setting blocks your own merges until a second collaborator exists. Two honest options: add a collaborator and keep the rule, or relax approvals to 0 and rely on the PR itself plus self-review before merging. **Do not disable "Require a pull request" to work around it** — that is the setting doing the real work, and it costs nothing when you are the only author.

Optional, both still absent:

- **`.github/pull_request_template.md`** — pre-fills the body sections above.
- **`.github/CODEOWNERS`** — auto-requests review from the right person per path.

---

## TBD

- **Enforcement tooling.** `commitlint` + `husky` would reject a non-conforming commit locally instead of relying on discipline; documented here, not installed. `coding-standards.md` leaves the related pre-commit hook open.
- **CI on PRs.** A `.github/workflows/` job running `npm run lint` and `npm run build` would turn "how was this verified" into a required status check.
- **The `gh` CLI is not installed**, so PRs are opened in the browser. Installing it would allow creating PRs from the terminal.
- **Commit signing** (GPG or SSH) — not configured, so commits are unsigned.
- **Issue and board conventions** — whether work is tracked in GitHub Issues, and whether PRs link them with `Closes #n`.
- **Whether the four pre-convention commits are ever squashed** — recommended against while `main` is shared (`CLAUDE.md` notes `AGENTS.md` is regenerated by `next dev`, so a clean tree is worth more than a tidy past).

**Reference:** [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
