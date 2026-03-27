/**
 * Normalise an API error message before showing it in the UI.
 * Strips stack traces, internal paths, and overly-technical details
 * that would leak implementation details to the user.
 */
export function normalizeApiError(msg: string | undefined, fallback: string): string {
  if (!msg) return fallback;

  // Strip anything that looks like a stack trace line
  const noStack = msg.split('\n')[0].trim();

  // Strip Node.js module paths  e.g. "at Object.<anonymous> (/app/src/...)"
  if (noStack.startsWith('at ') || noStack.includes('node_modules')) {
    return fallback;
  }

  // Truncate very long messages (> 200 chars) — likely a dump
  if (noStack.length > 200) return fallback;

  return noStack;
}
