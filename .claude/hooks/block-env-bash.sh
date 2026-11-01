#!/usr/bin/env bash
# PreToolUse hook (Bash): block shell commands that WRITE TO or DELETE the
# protected environment files (.env, .env.local).
#
# Companion to block-env-edits.sh, which guards the Write/Edit/NotebookEdit
# tools. This one closes the shell gap — e.g. `printf ... > .env`, `tee`,
# `sed -i`, `rm` — that those tool-level hooks can't see.
#
# Exit code 2 is how Claude Code reads a BLOCK: the tool call is rejected
# before it runs and this script's stderr is shown as the reason. Any other
# exit code (0) lets the command proceed.
#
# This is a best-effort string check, not an airtight sandbox: a path built
# from a variable or an unusual quoting style can still slip past it. Treat it
# as a guardrail, not a security boundary.

cmd="$(jq -r '.tool_input.command // empty')"

# Match .env or .env.local as a whole filename token, so that sibling files
# like .env.example or .env.production do NOT trip the block. The name must be
# preceded by a path boundary and not followed by another filename character.
env_token='(^|[^A-Za-z0-9._-])\.env(\.local)?($|[^A-Za-z0-9._-])'

# Indicators that the command writes to / modifies / deletes a file:
#   - output redirection: >  or  >>
#   - file-touching commands used as words: tee sed cp mv install truncate touch rm dd
write_op='(>>?|(^|[;&|(`[:space:]])(tee|sed|cp|mv|install|truncate|touch|rm|dd)([[:space:]]|$))'

if printf '%s' "$cmd" | grep -Eq "$env_token" \
   && printf '%s' "$cmd" | grep -Eq "$write_op"; then
  echo "Blocked: this command would write to or delete a protected environment file (.env/.env.local). Ask me first before modifying it." >&2
  exit 2
fi

exit 0
