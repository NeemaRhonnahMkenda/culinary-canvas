"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import logo from "../assets/logo.png";
import { call, setMe, useMe } from "../lib/client";
import { HOME_URL, cx, to } from "../lib/util";
import { Icon } from "./icons";
import { container } from "./ui";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/new", label: "Write", icon: true },
] as const;

export default function Header() {
  const { user, loaded, persistent } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  // The menu belongs to the page it was opened on, so it closes after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const [q, setQ] = useState(sp.get("q") ?? "");

  const active = (href: string) => (href === "/" ? pathname === to("/") || pathname === "/" : pathname.endsWith(href));

  async function logout() {
    await call("/auth/logout", { method: "POST" }).catch(() => {});
    setMe(null);
    router.push(to("/"));
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `${to("/categories")}?q=${encodeURIComponent(term)}` : to("/categories"));
  }

  const searchBox = (id: string) => (
    <form role="search" onSubmit={search} className="relative w-full lg:w-52">
      <label htmlFor={id} className="sr-only">
        Search recipes
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="h-10 w-full border-0 border-b border-[#9b9b9b] bg-transparent pr-8 pl-4 text-[15px] text-cc-ink outline-none placeholder:text-[#8a8a8a] focus:border-cc-accent"
      />
      <button type="submit" aria-label="Search" className="absolute top-1/2 right-1 -translate-y-1/2 p-1 text-cc-ink">
        <Icon.Search className="size-[18px]" />
      </button>
    </form>
  );

  const auth = !loaded ? (
    <span className="h-10 w-36 animate-pulse rounded-sm bg-cc-sunk" />
  ) : user ? (
    <div className="flex items-center gap-4">
      <Link href={to("/me")} className="text-right leading-tight" title="Your profile">
        <span className="block text-sm text-cc-text italic">Welcome Back</span>
        <span className="block max-w-48 truncate text-xl font-bold text-cc-accent">{[user.firstName, user.lastName].filter(Boolean).join(" ")}!</span>
      </Link>
      <button type="button" onClick={logout} className="text-sm text-cc-text underline-offset-4 hover:text-cc-accent hover:underline">
        Log out
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-1">
      <Link href={to("/login")} className="btn-cc inline-flex h-10 items-center rounded-sm px-5 text-[15px] font-semibold">
        Login
      </Link>
      <Link href={to("/signup")} className="btn-cc inline-flex h-10 items-center rounded-sm px-5 text-[15px] font-semibold">
        Signup
      </Link>
    </div>
  );

  return (
    <>
      {HOME_URL || !persistent ? (
        <div className="bg-cc-ink text-xs text-white/80">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-8">
            {HOME_URL ? (
              <Link href={HOME_URL} className="inline-flex items-center gap-1.5 hover:text-white">
                <Icon.ArrowLeft className="size-3.5" /> Neema&apos;s portfolio
              </Link>
            ) : (
              <span />
            )}
            {!persistent ? <span>Demo storage: sign-ups and recipes reset when the server restarts.</span> : null}
          </div>
        </div>
      ) : null}
      <header className="relative z-30 bg-white">
        <div className="mx-auto flex h-24 max-w-[1240px] items-center gap-6 px-4 sm:h-[146px] sm:px-8">
          <Link href={to("/")} className="flex shrink-0 items-center gap-3 text-cc-ink">
            <Image src={logo} alt="" className="size-14 sm:size-[76px]" priority />
            <span className="text-xl sm:text-[22px]">Culinary Canvas</span>
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href === "/new" && loaded && !user ? to("/login?next=%2Fnew") : to(n.href)}
                aria-current={active(n.href) ? "page" : undefined}
                className={cx("inline-flex items-center gap-1.5 text-[15px] uppercase", active(n.href) ? "text-cc-accent" : "text-cc-ink hover:text-cc-accent")}
              >
                {"icon" in n ? <Icon.Pencil className="size-4" /> : null}
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:block">{searchBox("cc-search")}</div>
          <div className="hidden lg:block">{auth}</div>

          <button
            type="button"
            className="ml-auto grid size-11 place-items-center rounded-sm border border-cc-line text-cc-ink lg:hidden"
            aria-expanded={open}
            aria-controls="cc-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpenOn(open ? null : pathname)}
          >
            {open ? <Icon.X className="size-5" /> : <Icon.Menu className="size-5" />}
          </button>
        </div>

        {open ? (
          <div id="cc-mobile-nav" className="border-t border-cc-line bg-white lg:hidden">
            <div className={cx(container, "flex flex-col gap-5 py-5")}>
              <nav aria-label="Main" className="flex flex-col">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href === "/new" && loaded && !user ? to("/login?next=%2Fnew") : to(n.href)}
                    className={cx("flex items-center gap-2 border-b border-cc-line py-3 text-[15px] uppercase", active(n.href) ? "text-cc-accent" : "text-cc-ink")}
                  >
                    {"icon" in n ? <Icon.Pencil className="size-4" /> : null}
                    {n.label}
                  </Link>
                ))}
              </nav>
              {searchBox("cc-search-m")}
              {auth}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
