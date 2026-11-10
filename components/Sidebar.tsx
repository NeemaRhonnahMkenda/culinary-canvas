"use client";

import Link from "next/link";
import { CATEGORIES, type Category, type RecipeView } from "../lib/types";
import { cx, to } from "../lib/util";
import { RecipePhoto, SideHeading, displayName, longDate } from "./ui";

export function LatestPosts({ recipes, className }: { recipes: RecipeView[]; className?: string }) {
  if (!recipes.length) return null;
  return (
    <section className={className}>
      <SideHeading>Latest Posts</SideHeading>
      <ul className="grid gap-6">
        {recipes.map((r) => (
          <li key={r.id}>
            <Link href={to(`/recipes/${r.id}`)} className="group grid grid-cols-[75px_1fr] gap-4">
              <span className="block size-[75px] overflow-hidden">
                <RecipePhoto r={r} sizes="75px" />
              </span>
              <span className="min-w-0">
                <span className="block font-cc-display text-[17px] font-bold leading-snug text-cc-ink group-hover:text-cc-accent">{r.title}</span>
                <span className="mt-1 flex flex-wrap justify-between gap-x-4 text-[15px]">
                  <span>Post By {displayName(r.author)}</span>
                  <span>{longDate(r.createdAt)}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CategoryButtons({ active, onPick }: { active: Category | null; onPick: (c: Category | null) => void }) {
  const opts: (Category | null)[] = [null, ...CATEGORIES];
  return (
    <section>
      <SideHeading>Categories</SideHeading>
      <div className="flex flex-wrap gap-x-5 gap-y-4 px-2" role="group" aria-label="Filter by category">
        {opts.map((c) => (
          <button
            key={c ?? "all"}
            type="button"
            aria-pressed={active === c}
            onClick={() => onPick(c)}
            className={cx("h-10 px-5 text-[15px] font-semibold text-white transition", active === c ? "bg-cc-ink" : "bg-cc-accent hover:bg-cc-accent-hover")}
          >
            {c ?? "All"}
          </button>
        ))}
      </div>
    </section>
  );
}
