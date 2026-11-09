import { connection, NextResponse } from "next/server";
import { currentUser, endSession, fail, hashPassword, rateLimited, sameOrigin, startSession, verifyPassword } from "../lib/auth";
import { createUser, publicUser, userByUsername } from "../lib/data";
import { kv } from "../lib/kv";
import { LoginSchema, SignupSchema } from "../lib/types";

async function body(req: Request) {
  if ((Number(req.headers.get("content-length")) || 0) > 10_000) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

/** GET /api/auth/me: who is signed in (and whether storage is persistent). */
export async function me() {
  await connection();
  const user = await currentUser();
  return NextResponse.json({ user: publicUser(user), persistent: kv().persistent });
}

/** POST /api/auth/signup */
export async function signup(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Bad origin");
  if (await rateLimited(req, "signup", 5)) return fail(429, "Too many sign-ups. Try again in a minute.");
  const parsed = SignupSchema.safeParse(await body(req));
  if (!parsed.success) return fail(400, "Check the highlighted fields", fieldErrors(parsed.error.issues));
  const { password, ...rest } = parsed.data;
  const user = await createUser({ ...rest, passHash: await hashPassword(password) });
  if (!user) return fail(409, "That username is taken", { username: "That username is taken" });
  const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });
  await startSession(res, user.id);
  return res;
}

/** POST /api/auth/login */
export async function login(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Bad origin");
  if (await rateLimited(req, "login", 10)) return fail(429, "Too many attempts. Try again in a minute.");
  const parsed = LoginSchema.safeParse(await body(req));
  if (!parsed.success) return fail(400, "Enter your username and password");
  const user = await userByUsername(parsed.data.username);
  // Same message (and same password work) whether the user exists or not.
  const ok = await verifyPassword(parsed.data.password, user?.passHash ?? "");
  if (!user || !ok) return fail(401, "Wrong username or password");
  const res = NextResponse.json({ user: publicUser(user) });
  await startSession(res, user.id);
  return res;
}

/** POST /api/auth/logout */
export async function logout(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Bad origin");
  const res = NextResponse.json({ ok: true });
  await endSession(res);
  return res;
}
