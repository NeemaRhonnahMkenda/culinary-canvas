import Link from "next/link";
import type { RecipeView } from "../lib/types";
import { to } from "../lib/util";
import { RecipePhoto, displayName, excerpt } from "./ui";

/** Home page card: square photo, category, title, short divider, excerpt, Read More. */
export default function RecipeCard({ r, priority }: { r: RecipeView; priority?: boolean }) {
  const href = to(`/recipes/${r.id}`);
  return (
    <article className="flex flex-col text-center">
      <Link href={href} className="group block aspect-square overflow-hidden" tabIndex={-1} aria-hidden>
        <RecipePhoto r={r} priority={priority} className="transition duration-500 group-hover:scale-[1.04]" />
      </Link>
      <p className="mt-7 text-sm tracking-wide text-cc-text uppercase">{r.category}</p>
      <h3 className="mt-2 font-cc-display text-[28px] leading-[1.15] text-cc-ink sm:text-[32px]">
        <Link href={href} className="hover:text-cc-accent">
          {r.title}
        </Link>
      </h3>
      <span className="mx-auto my-6 block h-px w-[100px] bg-cc-text" aria-hidden />
      <p className="text-[15px] leading-relaxed">{excerpt(r.description)}</p>
      <Link href={href} className="mt-5 font-semibold text-cc-accent hover:text-cc-accent-hover">
        Read More<span className="sr-only">: {r.title}</span>
      </Link>
    </article>
  );
}

/** Categories page card: photo, title, italic category, author, excerpt, divider. */
export function PostCard({ r }: { r: RecipeView }) {
  const href = to(`/recipes/${r.id}`);
  return (
    <article className="flex flex-col text-center">
      <Link href={href} className="group block aspect-square overflow-hidden" tabIndex={-1} aria-hidden>
        <RecipePhoto r={r} sizes="(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw" className="transition duration-500 group-hover:scale-[1.04]" />
      </Link>
      <h3 className="mt-6 font-cc-display text-xl text-cc-ink">
        <Link href={href} className="hover:text-cc-accent">
          {r.title}
        </Link>
      </h3>
      <p className="mt-1 italic">{r.category}</p>
      <p className="mt-3">Posted by {displayName(r.author)}</p>
      <p className="mt-3 text-[15px] leading-relaxed">{excerpt(r.description, 120)}</p>
      <span className="mx-auto mt-6 block h-px w-[100px] bg-cc-text" aria-hidden />
    </article>
  );
}
