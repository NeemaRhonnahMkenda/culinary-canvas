"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getRecipes } from "../../lib/client";
import { CATEGORIES, type Category, type RecipeView } from "../../lib/types";
import Footer from "../Footer";
import Header from "../Header";
import { PostCard } from "../RecipeCard";
import { CategoryButtons, LatestPosts } from "../Sidebar";
import { PeachBand, container } from "../ui";

/** "Blog Posts": every recipe in two columns, with latest posts and category filters on the side. */
export default function Categories() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = sp.get("q")?.trim() ?? "";
  const category = (CATEGORIES as readonly string[]).includes(sp.get("category") ?? "") ? (sp.get("category") as Category) : null;
  const key = `${q}|${category ?? ""}`;
  const [result, setResult] = useState<{ key: string; recipes: RecipeView[] } | null>(null);
  const recipes = result?.key === key ? result.recipes : null;
  const [latest, setLatest] = useState<RecipeView[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    const params: Record<string, string> = {};
    if (q) params.q = q;
    if (category) params.category = category;
    getRecipes(params)
      .then((r) => alive && (setResult({ key, recipes: r.recipes }), setErr("")))
      .catch(() => alive && setErr("Recipes couldn't load. Try refreshing."));
    return () => {
      alive = false;
    };
  }, [q, category, key]);

  useEffect(() => {
    getRecipes({}).then((r) => setLatest(r.recipes.slice(0, 4))).catch(() => {});
  }, []);

  function pick(c: Category | null) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (c) p.set("category", c);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const heading = q ? `Results for “${q}”` : category ? `${category} Recipes` : "Blog Posts";

  return (
    <>
      <Header />
      <PeachBand>
        <h1 className="font-cc-display text-4xl text-cc-ink sm:text-[44px]">{heading}</h1>
        {q || category ? (
          <p className="mt-3" aria-live="polite">
            {recipes ? `${recipes.length} recipe${recipes.length === 1 ? "" : "s"}` : "Searching…"}
            {q && category ? ` in ${category}` : ""}
            {" · "}
            <button type="button" onClick={() => router.replace(pathname)} className="font-semibold text-cc-accent hover:text-cc-accent-hover">
              Show all
            </button>
          </p>
        ) : null}
      </PeachBand>

      <main className={`${container} grid flex-1 gap-14 pt-12 pb-24 lg:grid-cols-[1fr_350px] lg:gap-8`}>
        <div>
          {err ? <p className="py-10 text-center text-[#c0392b]">{err}</p> : null}
          {recipes === null ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse bg-cc-sunk" />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-cc-display text-2xl text-cc-ink">Nothing matches that yet</p>
              <p className="mt-2">Try another word or category.</p>
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
              {recipes.map((r) => (
                <PostCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
        <aside className="grid content-start gap-12 lg:-mt-4">
          <LatestPosts recipes={latest} className="border-b border-cc-line pb-12" />
          <CategoryButtons active={category} onPick={pick} />
        </aside>
      </main>
      <Footer />
    </>
  );
}
