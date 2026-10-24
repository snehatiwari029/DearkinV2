// The OAuth redirect URL stays exactly origin + /auth/callback so it matches the
// provider allow-list; the post-login destination rides along in sessionStorage.
const REDIRECT_KEY = "dearkin:oauth-redirect";

export const safePath = (p: unknown) =>
  typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : undefined;

export const oauthCallbackUrl = (origin: string) => origin + "/auth/callback";

export function rememberOAuthRedirect(path: string | undefined) {
  try {
    if (path) sessionStorage.setItem(REDIRECT_KEY, path);
    else sessionStorage.removeItem(REDIRECT_KEY);
  } catch {
    // Storage can be unavailable (private mode); the callback falls back to /today.
  }
}

export function takeOAuthRedirect(): string | undefined {
  try {
    const path = safePath(sessionStorage.getItem(REDIRECT_KEY));
    sessionStorage.removeItem(REDIRECT_KEY);
    return path;
  } catch {
    return undefined;
  }
}
