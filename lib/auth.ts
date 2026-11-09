import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { kv } from "./kv";
import type { User } from "./types";
import { BASE_PATH } from "./util";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "cc_session";
const SESSION_DAYS = 7;

/* ---------- ids ---------- */

const ALPHA = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export function newId(len = 12) {
  let out = "";
  while (out.length < len) {
    for (const b of randomBytes(len * 2)) if (b < 248 && out.length < len) out += ALPHA[b % 62];
  }
  return out;
}

/* ---------- passwords (scrypt, per-user salt) ---------- */

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 32);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** Constant-time check. Accounts with an empty hash (the demo author) can never log in. */
export async function verifyPassword(pw: string, stored: string) {
  const [alg, saltHex, hashHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) {
    await scrypt(pw, randomBytes(16), 32); // same work either way: no timing hint
    return false;
  }
  const want = Buffer.from(hashHex, "hex");
  const got = await scrypt(pw, Buffer.from(saltHex, "hex"), want.length);
  return timingSafeEqual(want, got);
}

/* ---------- sessions: random token in an httpOnly cookie; only its hash is stored ---------- */

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const sessionKey = (token: string) => `cc:session:${sha(token)}`;

export async function startSession(res: NextResponse, userId: string) {
  const token = randomBytes(32).toString("base64url");
  await kv().set(sessionKey(token), userId, { ex: SESSION_DAYS * 86400 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: BASE_PATH, // never sent to the portfolio or other projects on the same domain
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession(res: NextResponse) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await kv().del(sessionKey(token));
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: BASE_PATH, maxAge: 0 });
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const uid = await kv().get(sessionKey(token));
  if (!uid) return null;
  const raw = await kv().get(`cc:user:${uid}`);
  return raw ? (JSON.parse(raw) as User) : null;
}

/* ---------- request guards ---------- */

/**
 * CSRF defence for cookie-authenticated writes: the browser's Origin must be this site.
 * (SameSite=Lax cookies already stop most cross-site posts; this closes the rest.)
 */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function rateLimited(req: Request, bucket: string, limit: number, windowSec = 60) {
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `cc:rl:${bucket}:${sha(ip).slice(0, 16)}:${Math.floor(Date.now() / 1000 / windowSec)}`;
  try {
    return (await kv().incr(key, windowSec)) > limit;
  } catch {
    return false;
  }
}

export function fail(status: number, error: string, fields?: Record<string, string>) {
  return NextResponse.json({ error, ...(fields ? { fields } : {}) }, { status });
}
