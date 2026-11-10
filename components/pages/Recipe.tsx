"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { call, getRecipes, useMe } from "../../lib/client";
import type { RecipeView } from "../../lib/types";
import { to } from "../../lib/util";
import Footer from "../Footer";
import Header from "../Header";
import { Icon } from "../icons";
import RecipeText from "../RecipeText";
import { LatestPosts } from "../Sidebar";
import { Button, PeachBand, RecipePhoto, container, displayName, longDate } from "../ui";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useMe();
  const [loadedRecipe, setLoaded] = useState<{ id: string; recipe: RecipeView | null } | null>(null);
  const recipe = loadedRecipe?.id === id ? loadedRecipe.recipe : undefined;
  const [latest, setLatest] = useState<RecipeView[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    call<{ recipe: RecipeView }>(`/recipes/${encodeURIComponent(id)}`)
      .then((r) => alive && setLoaded({ id, recipe: r.recipe }))
      .catch(() => alive && setLoaded({ id, recipe: null }));
    getRecipes({})
      .then((r) => alive && setLatest(r.recipes.filter((x) => x.id !== id).slice(0, 4)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);

  const mine = recipe && user && recipe.authorId === user.id;

  async function remove() {
    if (!recipe || !confirm(`Delete “${recipe.title}” permanently?`)) return;
    setDeleting(true);
    try {
      await call(`/recipes/${recipe.id}`, { method: "DELETE" });
      router.push(to("/me"));
    } catch {
      setDeleting(false);
      alert("Couldn't delete the recipe. Try again.");
    }
  }

  return (
    <>
      <Header />
      <PeachBand>
        {recipe === undefined ? (
          <div className="h-12 w-2/3 max-w-lg animate-pulse bg-white/60" />
        ) : (
          <h1 className="font-cc-display text-4xl leading-tight text-cc-ink sm:text-[54px]">{recipe ? recipe.title : "Recipe not found"}</h1>
        )}
      </PeachBand>

      <main className={`${container} grid flex-1 gap-14 pt-6 pb-24 lg:grid-cols-[1fr_330px] lg:gap-12`}>
        {recipe === undefined ? (
          <div className="aspect-square animate-pulse bg-cc-sunk" />
        ) : recipe === null ? (
          <div className="py-10">
            <p>It may have been deleted by its author.</p>
            <Link href={to("/categories")} className="mt-4 inline-block font-semibold text-cc-accent">
              Browse all recipes
            </Link>
          </div>
        ) : (
          <article className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-[15px]">
              <span className="inline-flex items-center gap-2">
                <Icon.User className="size-4" /> Post by {displayName(recipe.author)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon.Calendar className="size-4" /> {longDate(recipe.createdAt)}
              </span>
            </div>
            <div className="mt-4 aspect-square overflow-hidden sm:aspect-[5/4]">
              <RecipePhoto r={recipe} priority sizes="(min-width: 1024px) 730px, 100vw" />
            </div>

            {mine ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={to(`/recipes/${recipe.id}/edit`)} className="btn-cc inline-flex h-11 items-center gap-2 rounded-sm px-6 font-semibold">
                  <Icon.Pencil className="size-4" /> Edit
                </Link>
                <Button variant="danger" icon="Trash" disabled={deleting} onClick={remove}>
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
            ) : null}

            <h2 className="mt-8 mb-5 font-cc-display text-4xl text-cc-ink sm:text-[46px]">Instructions</h2>
            <RecipeText text={recipe.description} />
          </article>
        )}
        <aside className="lg:pt-10">
          <LatestPosts recipes={latest} />
        </aside>
      </main>
      <Footer />
    </>
  );
}
