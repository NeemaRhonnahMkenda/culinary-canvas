"use client";

import { useEffect, useState } from "react";
import { getRecipes, useMe } from "../../lib/client";
import type { RecipeView } from "../../lib/types";
import { to } from "../../lib/util";
import Footer from "../Footer";
import Header from "../Header";
import RecipeCard from "../RecipeCard";
import { container } from "../ui";

export default function Home() {
  const { user } = useMe();
  const [recipes, setRecipes] = useState<RecipeView[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    getRecipes({})
      .then((r) => alive && (setRecipes(r.recipes), setErr("")))
      .catch(() => alive && setErr("Recipes couldn't load. Try refreshing."));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Header />
      <main className={`${container} flex-1 pt-10 pb-24 sm:pt-20`}>
        <h1 className="sr-only">Culinary Canvas recipes</h1>
        {err ? <p className="py-10 text-center text-[#c0392b]">{err}</p> : null}
        {recipes === null ? (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-cc-sunk" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-cc-display text-3xl text-cc-ink">No recipes yet</p>
            <a href={to(user ? "/new" : "/signup")} className="btn-cc mt-6 inline-flex h-11 items-center rounded-sm px-6 font-semibold">
              {user ? "Write the first one" : "Sign up to share"}
            </a>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r, i) => (
              <RecipeCard key={r.id} r={r} priority={i < 3} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
