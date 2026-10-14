'use strict';

const PROTECTED = new Set(['.env', '.env.local']);

let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const target = input?.tool_input?.file_path ?? input?.tool_input?.notebook_path ?? '';
  const name = String(target).split(/[\\/]/).pop();

  if (!PROTECTED.has(name)) {
    process.exit(0);
  }

  console.error(
    `${name} is a protected environment file. Ask the user before editing it.`
  );

  // Exit code 2 is the hook-blocking code: it cancels the tool call and returns this
  // script's stderr to Claude as the reason, instead of letting the edit go through.
  process.exit(2);
});
