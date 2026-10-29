// Where to send the user after signing in (?volver=/roma/...). Only paths inside this site are accepted:
// an absolute URL, a protocol-relative one (//host) or a backslash trick (/\host, which browsers treat
// as //host) would turn the sign-in page into an open redirect for phishing links.
const INTERNAL_PATH = /^\/(?![/\\])[^\s\\]*$/;
const MAX_LENGTH = 512;

export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || value.length > MAX_LENGTH || !INTERNAL_PATH.test(value)) {
    return fallback;
  }
  return value;
}
