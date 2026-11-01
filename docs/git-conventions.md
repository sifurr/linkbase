# Linkbase — Git Conventions

How Linkbase names branches, writes commits, and merges work. Read this before committing, naming a branch, or opening a pull request.

---

## 1. Commits follow Conventional Commits

Every commit message uses a **Conventional Commits** type prefix with a short, **imperative** subject (e.g. `fix: redirect expired session to sign-in`).

- Types: **`feat`**, **`fix`**, **`docs`**, **`refactor`**, **`test`**, **`chore`**.
- The subject describes the change as a command ("add", "fix", "remove"), not a past-tense report.

## 2. Branches are named by type and feature

Branches are named **`<type>/<feature>`** — the same types as commits, followed by a short kebab-case description.

- Examples: **`feat/add-links`**, **`fix/session-redirect`**.

## 3. One feature per branch, merged via pull request

Each feature is built on **its own branch** and merged through a **pull request** — **never commit straight to `main`**.

## 4. Pull requests keep a clean history and require human review

- PRs keep a **clean history**.
- A **human review step is required before merge** — no PR merges without it.
