"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getRecipes, useMe } from "../../lib/client";
import { CATEGORIES, type Category, type RecipeView } from "../../lib/types";
import { cx, to } from "../../lib/util";
import Header from "../Header";
import { Icon } from "../icons";
import RecipeCard from "../RecipeCard";
import { CATEGORY_STYLE, inputCls } from "../ui";

export default function Home() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useMe();
  const q = sp.get("q") ?? "";
  const category = (CATEGORIES as readonly string[]).includes(sp.get("category") ?? "") ? (sp.get("category") as Category) : null;
  const [draft, setDraft] = useState(q);
  const [recipes, setRecipes] = useState<RecipeView[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    const params: Record<string, string> = {};
    if (q) params.q = q;
    if (category) params.category = category;
    getRecipes(params)
      .then((r) => alive && (setRecipes(r.recipes), setErr("")))
      .catch(() => alive && setErr("Recipes couldn't load. Try refreshing."));
    return () => {
      alive = false;
    };
  }, [q, category]);

  function go(next: { q?: string; category?: Category | null }) {
    const p = new URLSearchParams();
    const nq = next.q ?? q;
    const nc = next.category === undefined ? category : next.category;
    if (nq) p.set("q", nq);
    if (nc) p.set("category", nc);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const filtering = Boolean(q || category);
  const [featured, ...rest] = recipes ?? [];

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 sm:px-8">
        <section className="py-10 text-center sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cc-accent">Home cooking, shared</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-cc-display text-5xl leading-[1.02] sm:text-7xl">
            Recipes worth passing <em className="text-cc-accent">around</em>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-cc-muted sm:text-lg">
            Browse what people are cooking, find something for tonight, and share the dish your family always asks for.
          </p>

          <form
            role="search"
            className="relative mx-auto mt-8 max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              go({ q: draft.trim() });
            }}
          >
            <label htmlFor="cc-search" className="sr-only">
              Search recipes
            </label>
            <Icon.Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cc-muted" />
            <input
              id="cc-search"
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search chapati, chicken, a cook's name…"
              className={cx(inputCls, "min-h-14 rounded-full pr-28 pl-12 text-base shadow-sm")}
            />
            <button type="submit" className="absolute top-2 right-2 bottom-2 rounded-full bg-cc-ink px-5 text-sm font-semibold text-cc-bg hover:opacity-90">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by cooking method">
            <button
              type="button"
              onClick={() => go({ category: null })}
              aria-pressed={!category}
              className={cx("min-h-10 rounded-full border px-4 text-sm font-semibold", !category ? "border-cc-ink bg-cc-ink text-cc-bg" : "border-cc-line bg-cc-card hover:border-cc-ink/40")}
            >
              All
            </button>
            {CATEGORIES.map((c) => {
              const Ic = Icon[CATEGORY_STYLE[c].icon];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => go({ category: category === c ? null : c })}
                  aria-pressed={category === c}
                  className={cx(
                    "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold",
                    category === c ? "border-cc-ink bg-cc-ink text-cc-bg" : "border-cc-line bg-cc-card hover:border-cc-ink/40",
                  )}
                >
                  <Ic className="size-4" /> {c}
                </button>
              );
            })}
          </div>
        </section>

        {filtering ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-cc-muted" aria-live="polite">
              {recipes ? `${recipes.length} recipe${recipes.length === 1 ? "" : "s"}` : "Searching…"}
              {q ? ` for “${q}”` : ""}
              {category ? ` · ${category}` : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                setDraft("");
                go({ q: "", category: null });
              }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-cc-accent hover:underline"
            >
              <Icon.X className="size-4" /> Clear
            </button>
          </div>
        ) : null}

        {err ? <p className="py-10 text-center text-cc-accent">{err}</p> : null}

        {recipes === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-[1.5rem] bg-cc-sunk" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="rounded-[1.5rem] border-2 border-dashed border-cc-line px-6 py-14 text-center">
            <p className="font-cc-display text-2xl">Nothing matches that yet</p>
            <p className="mt-2 text-cc-muted">Try another word, or be the first to share it.</p>
            <a href={to(user ? "/new" : "/signup")} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-cc-accent px-5 text-sm font-semibold text-cc-accent-ink">
              {user ? "Share a recipe" : "Sign up to share"}
            </a>
          </div>
        ) : filtering ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <RecipeCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <>
            <h2 className="mb-5 font-cc-display text-3xl">Fresh from the kitchen</h2>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              {featured ? <RecipeCard r={featured} large /> : null}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                {rest.slice(0, 2).map((r) => (
                  <RecipeCard key={r.id} r={r} />
                ))}
              </div>
            </div>
            {rest.length > 2 ? (
              <>
                <h2 className="mt-14 mb-5 font-cc-display text-3xl">More to cook</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.slice(2).map((r) => (
                    <RecipeCard key={r.id} r={r} />
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </main>
      <footer className="border-t border-cc-line py-8 text-center text-sm text-cc-muted">
        Culinary Canvas · rebuilt in Next.js by Neema Mkenda
      </footer>
    </>
  );
}
