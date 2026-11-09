import { connection, NextResponse } from "next/server";
import { currentUser, fail, rateLimited, sameOrigin } from "../lib/auth";
import { createRecipe, deleteRecipe, getImage, getRecipe, listRecipes, updateRecipe } from "../lib/data";
import { CATEGORIES, MAX_IMAGE_CHARS, RecipeInputSchema } from "../lib/types";

type Ctx = { params: Promise<{ id: string }> };

async function readInput(req: Request) {
  if ((Number(req.headers.get("content-length")) || 0) > MAX_IMAGE_CHARS + 20_000) return { error: fail(413, "Photo is too large") };
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: fail(400, "Invalid request") };
  }
  const parsed = RecipeInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message;
    return { error: fail(400, "Check the highlighted fields", fields) };
  }
  return { data: parsed.data };
}

/** GET /api/recipes?q=&category=&mine=1 */
export async function list(req: Request) {
  await connection();
  const sp = new URL(req.url).searchParams;
  const category = sp.get("category") ?? undefined;
  const mine = sp.get("mine") === "1";
  const user = mine ? await currentUser() : null;
  if (mine && !user) return fail(401, "Log in to see your recipes");
  const recipes = await listRecipes({
    q: sp.get("q")?.slice(0, 100) || undefined,
    category: category && (CATEGORIES as readonly string[]).includes(category) ? category : undefined,
    authorId: user?.id,
  });
  return NextResponse.json({ recipes });
}

/** POST /api/recipes */
export async function create(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Bad origin");
  const user = await currentUser();
  if (!user) return fail(401, "Log in to post a recipe");
  if (await rateLimited(req, "post", 10)) return fail(429, "Slow down a little");
  const r = await readInput(req);
  if ("error" in r) return r.error;
  const recipe = await createRecipe(user.id, r.data);
  return NextResponse.json({ recipe }, { status: 201 });
}

/** GET /api/recipes/:id */
export async function read(_req: Request, { params }: Ctx) {
  await connection();
  const recipe = await getRecipe((await params).id);
  return recipe ? NextResponse.json({ recipe }) : fail(404, "Recipe not found");
}

/** PUT /api/recipes/:id (author only) */
export async function update(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return fail(403, "Bad origin");
  const user = await currentUser();
  if (!user) return fail(401, "Log in first");
  const existing = await getRecipe((await params).id);
  // Not yours looks exactly like not found: no hint that the recipe exists.
  if (!existing || existing.authorId !== user.id) return fail(404, "Recipe not found");
  const r = await readInput(req);
  if ("error" in r) return r.error;
  const { author: _author, ...plain } = existing;
  void _author;
  return NextResponse.json({ recipe: await updateRecipe(plain, r.data) });
}

/** DELETE /api/recipes/:id (author only) */
export async function remove(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return fail(403, "Bad origin");
  const user = await currentUser();
  if (!user) return fail(401, "Log in first");
  const existing = await getRecipe((await params).id);
  if (!existing || existing.authorId !== user.id) return fail(404, "Recipe not found");
  await deleteRecipe(existing);
  return NextResponse.json({ ok: true });
}

/** GET /api/images/:id: serves an uploaded photo. Ids are random and never reused, so cache forever. */
export async function image(_req: Request, { params }: Ctx) {
  await connection();
  const data = await getImage((await params).id);
  if (!data) return new NextResponse("Not found", { status: 404 });
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data);
  if (!m) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(Buffer.from(m[2], "base64"), {
    headers: {
      "Content-Type": m[1],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
