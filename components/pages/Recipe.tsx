"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { call, getRecipes, useMe } from "../../lib/client";
import type { RecipeView } from "../../lib/types";
import { fmtDate, minutesToRead, to } from "../../lib/util";
import Header from "../Header";
import { Icon } from "../icons";
import RecipeCard from "../RecipeCard";
import RecipeText from "../RecipeText";
import { Button, CategoryChip, Cover, displayName } from "../ui";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useMe();
  const [recipe, setRecipe] = useState<RecipeView | null | undefined>(undefined);
  const [more, setMore] = useState<RecipeView[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    call<{ recipe: RecipeView }>(`/recipes/${encodeURIComponent(id)}`)
      .then((r) => alive && setRecipe(r.recipe))
      .catch(() => alive && setRecipe(null));
    getRecipes({})
      .then((r) => alive && setMore(r.recipes.filter((x) => x.id !== id).slice(0, 3)))
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 sm:px-8">
        <Link href={to("/")} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cc-muted hover:text-cc-ink">
          <Icon.ArrowLeft className="size-4" /> All recipes
        </Link>

        {recipe === undefined ? (
          <div className="mt-6 h-96 animate-pulse rounded-[1.5rem] bg-cc-sunk" />
        ) : recipe === null ? (
          <div className="py-24 text-center">
            <h1 className="font-cc-display text-4xl">Recipe not found</h1>
            <p className="mt-2 text-cc-muted">It may have been deleted by its author.</p>
          </div>
        ) : (
          <article className="mt-6">
            <header className="grid items-end gap-8 lg:grid-cols-[1.1fr_1fr]">
              <div className="order-2 lg:order-1">
                <CategoryChip c={recipe.category} />
                <h1 className="mt-4 font-cc-display text-5xl leading-[1.02] sm:text-6xl">{recipe.title}</h1>
                <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cc-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon.User className="size-4" /> {displayName(recipe.author)}
                  </span>
                  <span>{fmtDate(recipe.createdAt)}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon.Clock className="size-4" /> {minutesToRead(recipe.description)} min read
                  </span>
                </p>
                {mine ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link href={to(`/recipes/${recipe.id}/edit`)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cc-ink px-5 text-sm font-semibold text-cc-bg">
                      <Icon.Pencil className="size-4" /> Edit
                    </Link>
                    <Button variant="danger" icon="Trash" disabled={deleting} onClick={remove}>
                      {deleting ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="order-1 aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:order-2">
                <Cover imageId={recipe.imageId} category={recipe.category} title={recipe.title} />
              </div>
            </header>

            <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem]">
              <RecipeText text={recipe.description} />
              {more.length ? (
                <aside>
                  <h2 className="mb-4 font-cc-display text-2xl">Cook next</h2>
                  <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
                    {more.map((r) => (
                      <RecipeCard key={r.id} r={r} />
                    ))}
                  </div>
                </aside>
              ) : null}
            </div>
          </article>
        )}
      </main>
    </>
  );
}
