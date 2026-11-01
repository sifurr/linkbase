#!/usr/bin/env bash
# PreToolUse hook: block edits to environment files (.env, .env.local).
#
# Claude Code reads this hook's exit code: exit 2 signals a BLOCK — the tool
# call is rejected before it runs and whatever we print to stderr is shown as
# the reason. Any other exit code (0) lets the edit proceed.

# The file-editing tools put the target in tool_input.file_path.
file_path="$(jq -r '.tool_input.file_path // empty')"

# Compare on the basename so both "./.env" and "/abs/path/.env.local" match.
case "$(basename "$file_path")" in
  .env|.env.local)
    echo "Blocked: $(basename "$file_path") is a protected environment file. Ask me first before editing it." >&2
    exit 2
    ;;
esac

exit 0
