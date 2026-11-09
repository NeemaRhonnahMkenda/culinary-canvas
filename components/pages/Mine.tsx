"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRecipes, useMe } from "../../lib/client";
import type { RecipeView } from "../../lib/types";
import { to } from "../../lib/util";
import Header from "../Header";
import { Icon } from "../icons";
import RecipeCard from "../RecipeCard";
import { displayName } from "../ui";

export default function Mine() {
  const { user, loaded } = useMe();
  const router = useRouter();
  const [recipes, setRecipes] = useState<RecipeView[] | null>(null);

  useEffect(() => {
    if (loaded && !user) router.replace(to("/login?next=%2Fme"));
    if (!user) return;
    getRecipes({ mine: "1" }).then((r) => setRecipes(r.recipes)).catch(() => setRecipes([]));
  }, [loaded, user, router]);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 py-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cc-accent">Your kitchen</p>
            <h1 className="mt-2 font-cc-display text-5xl">{user ? displayName(user) : " "}</h1>
            {user ? <p className="text-cc-muted">@{user.username}</p> : null}
          </div>
          <Link href={to("/new")} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cc-accent px-5 text-sm font-semibold text-cc-accent-ink">
            <Icon.Plus className="size-4" /> Share a recipe
          </Link>
        </div>
        {recipes === null ? (
          <div className="h-64 animate-pulse rounded-[1.5rem] bg-cc-sunk" />
        ) : recipes.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <RecipeCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border-2 border-dashed border-cc-line px-6 py-14 text-center">
            <p className="font-cc-display text-2xl">No recipes yet</p>
            <p className="mt-2 text-cc-muted">Share the dish everyone asks you to bring.</p>
          </div>
        )}
      </main>
    </>
  );
}
