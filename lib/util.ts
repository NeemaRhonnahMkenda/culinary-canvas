/*
 * Culinary Canvas runs two ways:
 *  - standalone (this repo, Next basePath "/culinary-canvas")
 *  - embedded in the portfolio at /culinary-canvas (no basePath there)
 * The host sets these at build time in its next.config `env`.
 */

/** Absolute path prefix for raw URLs: fetch() to the API and image URLs. */
export const BASE_PATH = process.env.NEXT_PUBLIC_CC_BASE ?? "/culinary-canvas";

/** Prefix for <Link> and router paths. Empty when Next's basePath already adds it. */
export const ROUTE_PREFIX = process.env.NEXT_PUBLIC_CC_ROUTE_PREFIX ?? "";

/** Optional "back to portfolio" link shown in the header when embedded. */
export const HOME_URL = process.env.NEXT_PUBLIC_CC_HOME_URL ?? "";

export function to(path: string) {
  if (path === "/") return ROUTE_PREFIX || "/";
  return ROUTE_PREFIX + path;
}

export const api = (p: string) => `${BASE_PATH}/api${p}`;
export const imageUrl = (id: string) => `${BASE_PATH}/api/images/${id}`;

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

/** Rough reading time for a recipe write-up. */
export function minutesToRead(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}
