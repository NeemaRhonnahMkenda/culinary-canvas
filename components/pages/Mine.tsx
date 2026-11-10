"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import chef from "../../assets/chef.png";
import { call, getRecipes, setMe, useMe } from "../../lib/client";
import type { RecipeView } from "../../lib/types";
import { to } from "../../lib/util";
import Footer from "../Footer";
import Header from "../Header";
import { Icon } from "../icons";
import { PostCard } from "../RecipeCard";
import { container, displayName } from "../ui";

export default function Mine() {
  const { user, loaded } = useMe();
  const router = useRouter();
  const [recipes, setRecipes] = useState<RecipeView[] | null>(null);

  useEffect(() => {
    if (loaded && !user) router.replace(to("/login?next=%2Fme"));
    if (!user) return;
    getRecipes({ mine: "1" }).then((r) => setRecipes(r.recipes)).catch(() => setRecipes([]));
  }, [loaded, user, router]);

  async function logout() {
    await call("/auth/logout", { method: "POST" }).catch(() => {});
    setMe(null);
    router.push(to("/"));
  }

  return (
    <>
      <Header />
      <section className="bg-cc-peach">
        <div className={`${container} grid items-center gap-6 py-12 sm:grid-cols-[1fr_auto] sm:py-16`}>
          <div>
            <h1 className="font-cc-display text-5xl leading-none text-cc-ink sm:text-[76px]">Welcome Back</h1>
            <p className="mt-3 font-cc-display text-3xl text-cc-ink italic sm:text-[48px]">{user ? `${displayName(user)}!` : "\u00a0"}</p>
            <span className="mt-10 block h-px w-[300px] max-w-full bg-cc-muted" aria-hidden />
          </div>
          <Image src={chef} alt="" priority className="mx-auto w-48 sm:w-72 lg:w-80" />
        </div>
      </section>

      <main className={`${container} flex-1 pt-12 pb-24`}>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-cc-display text-3xl text-cc-ink">Your Recipes</h2>
          <div className="flex items-center gap-4">
            <button type="button" onClick={logout} className="text-sm underline-offset-4 hover:text-cc-accent hover:underline">
              Log out
            </button>
            <Link href={to("/new")} className="btn-cc inline-flex h-11 items-center gap-2 rounded-sm px-6 font-semibold">
              <Icon.Pencil className="size-4" /> Write a recipe
            </Link>
          </div>
        </div>
        {recipes === null ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-cc-sunk" />
            ))}
          </div>
        ) : recipes.length ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <PostCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-cc-line px-6 py-14 text-center">
            <p className="font-cc-display text-2xl text-cc-ink">No recipes yet</p>
            <p className="mt-2">Share the dish everyone asks you to bring.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
