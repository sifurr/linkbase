/**
 * The onboarding (select-handle) screen. A freshly-authenticated user with no
 * handle is sent here. Kept as a single constant so the actions, the proxy
 * matcher, and the gate all agree on the path.
 */
export const ONBOARDING_PATH = "/onboarding";

/**
 * The signed-in home. Protected, and gated behind having a handle.
 */
export const DASHBOARD_PATH = "/dashboard";

/**
 * Where an onboarded user lands after authenticating, and where onboarding
 * sends them once the handle is set.
 */
export const POST_ONBOARDING_REDIRECT = DASHBOARD_PATH;

/**
 * Path prefixes that require an authenticated session. The proxy matcher and the
 * `authorized` callback both guard these. Route groups don't appear in the URL,
 * so protection is keyed on real paths.
 */
export const PROTECTED_PREFIXES = [ONBOARDING_PATH, DASHBOARD_PATH] as const;
