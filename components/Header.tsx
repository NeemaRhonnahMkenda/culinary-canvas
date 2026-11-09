"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { call, setMe, useMe } from "../lib/client";
import { HOME_URL, cx, to } from "../lib/util";
import { Icon } from "./icons";
import { displayName } from "./ui";

export default function Header() {
  const { user, loaded, persistent } = useMe();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  async function logout() {
    await call("/auth/logout", { method: "POST" }).catch(() => {});
    setMe(null);
    setMenu(false);
    router.push(to("/"));
  }

  return (
    <>
      {!persistent ? (
        <p className="bg-cc-butter-soft px-4 py-2 text-center text-xs font-medium">
          Demo storage: sign-ups and recipes reset when the server restarts.
        </p>
      ) : null}
      <header className="sticky top-0 z-30 border-b border-cc-line bg-cc-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-8">
          {HOME_URL ? (
            <Link href={HOME_URL} aria-label="Back to portfolio" title="Back to portfolio" className="grid size-9 place-items-center rounded-full text-cc-muted hover:bg-cc-sunk hover:text-cc-ink">
              <Icon.ArrowLeft className="size-[18px]" />
            </Link>
          ) : null}
          <Link href={to("/")} className="flex items-center gap-2 font-cc-display text-2xl leading-none">
            <span className="grid size-9 place-items-center rounded-full bg-cc-accent text-cc-accent-ink">
              <Icon.Hat className="size-5" />
            </span>
            <span className="hidden sm:inline">Culinary Canvas</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <Link
                href={to("/new")}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-cc-accent px-4 text-sm font-semibold text-cc-accent-ink hover:brightness-110"
              >
                <Icon.Plus className="size-4" /> <span className="hidden sm:inline">Share a recipe</span><span className="sm:hidden">Post</span>
              </Link>
            ) : null}
            {!loaded ? (
              <span className="h-10 w-24 animate-pulse rounded-full bg-cc-sunk" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenu((m) => !m)}
                  aria-expanded={menu}
                  aria-haspopup="menu"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cc-line bg-cc-card py-1 pr-3 pl-1 text-sm font-semibold"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-cc-olive text-xs font-bold text-white">
                    {displayName(user).slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-28 truncate sm:inline">{user.firstName}</span>
                </button>
                {menu ? (
                  <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-cc-line bg-cc-card py-1 shadow-xl">
                    <p className="truncate px-4 py-2 text-xs text-cc-muted">@{user.username}</p>
                    <Link role="menuitem" href={to("/me")} onClick={() => setMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cc-sunk">
                      <Icon.User className="size-4" /> My recipes
                    </Link>
                    <button role="menuitem" type="button" onClick={logout} className={cx("flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-cc-sunk")}>
                      <Icon.LogOut className="size-4" /> Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link href={to("/login")} className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-cc-muted hover:text-cc-ink">
                  Log in
                </Link>
                <Link href={to("/signup")} className="inline-flex min-h-10 items-center rounded-full bg-cc-ink px-4 text-sm font-semibold text-cc-bg hover:opacity-90">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
