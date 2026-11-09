"use client";

import { useId } from "react";
import type { Category } from "../lib/types";
import { cx, imageUrl } from "../lib/util";
import { Icon, type IconName } from "./icons";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-accent";

export function Button({
  variant = "secondary",
  icon,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; icon?: IconName }) {
  const Ic = icon ? Icon[icon] : null;
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-cc-accent text-cc-accent-ink hover:brightness-110",
        variant === "secondary" && "border border-cc-line bg-cc-card hover:border-cc-ink/40",
        variant === "ghost" && "text-cc-muted hover:bg-cc-sunk hover:text-cc-ink",
        variant === "danger" && "border border-cc-line bg-cc-card text-cc-accent hover:border-cc-accent",
        focus,
        className,
      )}
    >
      {Ic ? <Ic className="size-[18px]" /> : null}
      {children}
    </button>
  );
}

export const inputCls =
  "min-h-11 w-full rounded-xl border border-cc-line bg-cc-card px-3.5 text-[15px] outline-none transition placeholder:text-cc-muted/60 focus:border-cc-accent focus:ring-4 focus:ring-cc-accent/15";

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      {children(id, msgId)}
      {error ? (
        <p id={msgId} className="text-xs font-medium text-cc-accent">
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

export const CATEGORY_STYLE: Record<Category, { icon: IconName; chip: string; art: string; blurb: string }> = {
  Baked: { icon: "Baked", chip: "bg-cc-butter-soft text-[#8a6100]", art: "from-[#fcefd0] to-[#f3d189]", blurb: "Out of the oven" },
  Boiled: { icon: "Boiled", chip: "bg-cc-olive-soft text-cc-olive", art: "from-[#eef1dc] to-[#c9d39a]", blurb: "From the pot" },
  Fried: { icon: "Fried", chip: "bg-cc-accent-soft text-cc-accent", art: "from-[#fde6dc] to-[#f1a98f]", blurb: "Hot from the pan" },
};

export function CategoryChip({ c }: { c: Category }) {
  const s = CATEGORY_STYLE[c];
  const Ic = Icon[s.icon];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide", s.chip)}>
      <Ic className="size-3.5" /> {c}
    </span>
  );
}

/** The recipe photo, or a warm illustrated placeholder for its cooking method. */
export function Cover({ imageId, category, title, className }: { imageId: string | null; category: Category; title: string; className?: string }) {
  if (imageId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl(imageId)} alt={title} loading="lazy" className={cx("size-full object-cover", className)} />
    );
  }
  const s = CATEGORY_STYLE[category];
  const Ic = Icon[s.icon];
  return (
    <div className={cx("relative grid size-full place-items-center overflow-hidden bg-gradient-to-br", s.art, className)} role="img" aria-label={`${category} recipe, no photo`}>
      <span className="absolute -top-6 -right-6 size-28 rounded-full bg-white/30" aria-hidden />
      <span className="absolute -bottom-10 -left-8 size-36 rounded-full bg-white/20" aria-hidden />
      <Ic className="relative size-14 text-cc-ink/40" />
    </div>
  );
}

export function displayName(u: { firstName: string; lastName: string; username: string } | null) {
  if (!u) return "Unknown cook";
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username;
}
