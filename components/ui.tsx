"use client";

import Image from "next/image";
import { useId } from "react";
import { DEFAULT_PHOTO, PHOTOS } from "../lib/photos";
import type { Recipe } from "../lib/types";
import { cx, imageUrl } from "../lib/util";
import { Icon, type IconName } from "./icons";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-accent";

/** Page width used by the original site (Bootstrap container). */
export const container = "mx-auto w-full max-w-[1140px] px-4 sm:px-6";

export function Button({
  variant = "secondary",
  icon,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "dark" | "secondary" | "ghost" | "danger"; icon?: IconName }) {
  const Ic = icon ? Icon[icon] : null;
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-6 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "btn-cc",
        variant === "dark" && "bg-cc-ink text-white hover:bg-[#333]",
        variant === "secondary" && "border border-cc-line bg-cc-card text-cc-ink hover:border-cc-ink/40",
        variant === "ghost" && "text-cc-text hover:text-cc-ink",
        variant === "danger" && "border border-cc-line bg-cc-card text-[#c0392b] hover:border-[#c0392b]",
        focus,
        className,
      )}
    >
      {Ic ? <Ic className="size-[18px]" /> : null}
      {children}
    </button>
  );
}

/** Underlined inputs, like the original forms. */
export const inputCls =
  "min-h-11 w-full border-0 border-b border-[#cfcfcf] bg-transparent px-1 text-[15px] text-cc-ink outline-none transition placeholder:text-cc-muted focus:border-cc-accent";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (id: string, describedBy?: string) => React.ReactNode;
}) {
  const id = useId();
  const msgId = error || hint ? `${id}-msg` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-cc-text">
        {label}
      </label>
      {children(id, msgId)}
      {error ? (
        <p id={msgId} className="text-xs font-semibold text-[#c0392b]">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="text-xs text-cc-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The recipe's photo: an uploaded one, a bundled one for the demo recipes,
 * or the default board (as the original did) when there is none.
 */
export function RecipePhoto({
  r,
  className,
  sizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw",
  priority,
}: {
  r: Pick<Recipe, "imageId" | "photo" | "title">;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (r.imageId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl(r.imageId)} alt={r.title} loading={priority ? "eager" : "lazy"} className={cx("size-full object-cover", className)} />
    );
  }
  const src = (r.photo && PHOTOS[r.photo]) || DEFAULT_PHOTO;
  return <Image src={src} alt={r.title} sizes={sizes} priority={priority} placeholder="blur" className={cx("size-full object-cover", className)} />;
}

/** Full-width peach band with a big heading, used on most pages of the original. */
export function PeachBand({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("bg-cc-peach", className)}>
      <div className={cx(container, "py-14 sm:py-20")}>{children}</div>
    </section>
  );
}

export function SideHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-5 font-cc-display text-lg uppercase tracking-tight text-cc-ink">{children}</h2>;
}

/** Plain-text preview: "3 cups flour, 1 tsp salt, …" without headings, bullets or step numbers. */
export function excerpt(text: string, max = 150) {
  const s = text
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^([-*•]|\d+[.)])\s*/, ""))
    .filter((l) => l && !/^(ingredients|method|instructions|directions|description|steps|notes?):?$/i.test(l))
    .join(", ");
  return s.length > max ? s.slice(0, max).replace(/[\s,]+\S*$/, "") + " …" : s;
}

export function displayName(u: { firstName: string; lastName: string; username: string } | null) {
  if (!u) return "Unknown cook";
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username;
}

/** "November 9, 2026", the original's date style. */
export function longDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}
