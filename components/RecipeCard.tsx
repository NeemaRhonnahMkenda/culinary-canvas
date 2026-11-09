import Link from "next/link";
import type { RecipeView } from "../lib/types";
import { fmtDate, minutesToRead, to } from "../lib/util";
import { CategoryChip, Cover, displayName } from "./ui";

export default function RecipeCard({ r, large = false }: { r: RecipeView; large?: boolean }) {
  // Preview: the recipe's lines without headings, bullets or step numbers, e.g. "3 cups flour, 1 tsp salt, …"
  const summary = r.description
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^([-*•]|\d+[.)])\s*/, ""))
    .filter((l) => l && !/^(ingredients|method|instructions|directions|description|steps|notes?):?$/i.test(l))
    .join(", ")
    .slice(0, 140);
  return (
    <Link
      href={to(`/recipes/${r.id}`)}
      className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-cc-line bg-cc-card transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-cc-accent"
    >
      <div className={large ? "aspect-[16/10]" : "aspect-[4/3]"}>
        <Cover imageId={r.imageId} category={r.category} title={r.title} className="transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <CategoryChip c={r.category} />
        <h3 className={`mt-3 font-cc-display leading-tight ${large ? "text-3xl" : "text-2xl"}`}>{r.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-cc-muted">{summary}…</p>
        <p className="mt-auto pt-4 text-xs text-cc-muted">
          {displayName(r.author)} · {fmtDate(r.createdAt)} · {minutesToRead(r.description)} min read
        </p>
      </div>
    </Link>
  );
}
