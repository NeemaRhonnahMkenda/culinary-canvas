import "server-only";
import seed from "../data/recipes.json";
import { newId } from "./auth";
import { kv } from "./kv";
import type { Category, PublicUser, Recipe, RecipeView, User } from "./types";

const K = {
  user: (id: string) => `cc:user:${id}`,
  uname: (u: string) => `cc:uname:${u}`,
  recipe: (id: string) => `cc:recipe:${id}`,
  img: (id: string) => `cc:img:${id}`,
  index: "cc:recipes", // sorted set: recipe ids by creation time
  seeded: "cc:seeded:v2",
};

export function publicUser(u: User | null): PublicUser | null {
  return u ? { id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName } : null;
}

/* ---------- users ---------- */

export async function createUser(input: { username: string; firstName: string; lastName: string; passHash: string }) {
  const id = newId(10);
  // Claim the username atomically; fails if someone already has it.
  if (!(await kv().set(K.uname(input.username), id, { nx: true }))) return null;
  const user: User = { id, ...input, createdAt: new Date().toISOString() };
  await kv().set(K.user(id), JSON.stringify(user));
  return user;
}

export async function userByUsername(username: string) {
  const id = await kv().get(K.uname(username));
  if (!id) return null;
  const raw = await kv().get(K.user(id));
  return raw ? (JSON.parse(raw) as User) : null;
}

async function usersById(ids: string[]) {
  const uniq = [...new Set(ids)];
  const raws = await kv().mget(uniq.map(K.user));
  const map = new Map<string, PublicUser>();
  raws.forEach((r) => {
    if (r) {
      const u = JSON.parse(r) as User;
      map.set(u.id, publicUser(u)!);
    }
  });
  return map;
}

/* ---------- seed: original demo recipes on first use ---------- */

const SEED_AUTHOR = "culinarycanvas";

async function ensureSeeded() {
  if (await kv().get(K.seeded)) return;
  if (!(await kv().set(K.seeded, "1", { nx: true }))) return; // another request is seeding
  const authorId = SEED_AUTHOR;
  const author: User = { id: authorId, username: "culinarycanvas", firstName: "Culinary", lastName: "Canvas", passHash: "", createdAt: new Date().toISOString() };
  await kv().set(K.user(authorId), JSON.stringify(author));
  await kv().set(K.uname("culinarycanvas"), authorId, { nx: true });

  // Replace demo recipes from an older seed; people's own recipes are untouched.
  const oldIds = await kv().zrevrange(K.index, 0, 999);
  const olds = await kv().mget(oldIds.map(K.recipe));
  for (const raw of olds) {
    if (!raw) continue;
    const r = JSON.parse(raw) as Recipe;
    if (r.authorId === SEED_AUTHOR) await deleteRecipe(r);
  }

  const now = Date.now();
  for (const [i, r] of (seed as { title: string; category: Category; description: string; photo?: string }[]).entries()) {
    const t = new Date(now - (i + 1) * 36e5 * 7).toISOString();
    const rec: Recipe = { id: newId(10), title: r.title, category: r.category, description: r.description, imageId: null, photo: r.photo, authorId, createdAt: t, updatedAt: t };
    await kv().set(K.recipe(rec.id), JSON.stringify(rec));
    await kv().zadd(K.index, Date.parse(t), rec.id);
  }
}

/* ---------- recipes ---------- */

export async function listRecipes(opts: { q?: string; category?: string; authorId?: string; limit?: number } = {}): Promise<RecipeView[]> {
  await ensureSeeded();
  const ids = await kv().zrevrange(K.index, 0, 499);
  const raws = await kv().mget(ids.map(K.recipe));
  let list = raws.filter(Boolean).map((r) => JSON.parse(r!) as Recipe);
  if (opts.category) list = list.filter((r) => r.category === opts.category);
  if (opts.authorId) list = list.filter((r) => r.authorId === opts.authorId);
  const authors = await usersById(list.map((r) => r.authorId));
  let views = list.map((r) => ({ ...r, author: authors.get(r.authorId) ?? null }));
  if (opts.q) {
    // Same idea as the Django version: any word may match title, text, category or author name.
    const words = opts.q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
    views = views.filter((r) => {
      const hay = [r.title, r.description, r.category, r.author?.username, r.author?.firstName, r.author?.lastName].join(" ").toLowerCase();
      return words.some((w) => hay.includes(w));
    });
  }
  return views.slice(0, opts.limit ?? 500);
}

export async function getRecipe(id: string): Promise<RecipeView | null> {
  await ensureSeeded();
  if (!/^[0-9A-Za-z]{6,20}$/.test(id)) return null;
  const raw = await kv().get(K.recipe(id));
  if (!raw) return null;
  const r = JSON.parse(raw) as Recipe;
  const authors = await usersById([r.authorId]);
  return { ...r, author: authors.get(r.authorId) ?? null };
}

async function storeImage(dataUrl: string) {
  const id = newId(16);
  await kv().set(K.img(id), dataUrl);
  return id;
}

export async function getImage(id: string) {
  if (!/^[0-9A-Za-z]{16}$/.test(id)) return null;
  return kv().get(K.img(id));
}

export async function createRecipe(authorId: string, input: { title: string; category: Category; description: string; image: string | null | "keep" }) {
  const now = new Date().toISOString();
  const imageId = input.image && input.image !== "keep" ? await storeImage(input.image) : null;
  const r: Recipe = { id: newId(10), title: input.title, category: input.category, description: input.description, imageId, authorId, createdAt: now, updatedAt: now };
  await kv().set(K.recipe(r.id), JSON.stringify(r));
  await kv().zadd(K.index, Date.parse(now), r.id);
  return r;
}

export async function updateRecipe(existing: Recipe, input: { title: string; category: Category; description: string; image: string | null | "keep" }) {
  let imageId = existing.imageId;
  if (input.image !== "keep") {
    if (existing.imageId) await kv().del(K.img(existing.imageId));
    imageId = input.image ? await storeImage(input.image) : null;
  }
  const photo = input.image === "keep" ? existing.photo : undefined;
  const r: Recipe = { ...existing, title: input.title, category: input.category, description: input.description, imageId, photo, updatedAt: new Date().toISOString() };
  await kv().set(K.recipe(r.id), JSON.stringify(r));
  return r;
}

export async function deleteRecipe(r: Recipe) {
  await kv().del(K.recipe(r.id));
  await kv().zrem(K.index, r.id);
  if (r.imageId) await kv().del(K.img(r.imageId));
}
