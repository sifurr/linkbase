/**
 * Where a user lands after authenticating. This is the select-handle screen,
 * built by a separate feature — kept here as a single constant so that feature
 * (and the middleware matcher) has one place to agree on the path.
 */
export const POST_AUTH_REDIRECT = "/select-handle";

/**
 * Path prefixes that require an authenticated session. The middleware matcher
 * and the `authorized` callback both guard these. Route groups like
 * `(dashboard)` don't appear in the URL, so protection is keyed on real paths.
 */
export const PROTECTED_PREFIXES = ["/dashboard", "/select-handle"] as const;
