"use client";

import Image from "next/image";
import Link from "next/link";
import bg from "../../assets/login-bg.jpg";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApiError, call, setMe } from "../../lib/client";
import type { PublicUser } from "../../lib/types";
import { to } from "../../lib/util";
import Footer from "../Footer";
import Header from "../Header";
import { Button, Field } from "../ui";

/** White boxed inputs with an orange underline, as on the original login card. */
const authInput =
  "min-h-10 w-full border-0 border-b border-cc-accent/70 bg-white px-3 text-[15px] text-cc-ink outline-none focus:border-cc-accent focus:ring-2 focus:ring-cc-accent/25";

/** Only allow in-app return paths like "/new" (never another site). */
function safeNext(n: string | null) {
  return n && /^\/[A-Za-z0-9/_-]*$/.test(n) && !n.startsWith("//") ? n : "/";
}

export default function Auth({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [f, setF] = useState({ username: "", firstName: "", lastName: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError("");
    try {
      const body = mode === "login" ? { username: f.username, password: f.password } : f;
      const { user } = await call<{ user: PublicUser }>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
      setMe(user);
      router.push(to(next));
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields ?? {});
        setFormError(err.message);
      } else setFormError("Something went wrong. Try again.");
      setBusy(false);
    }
  }

  const title = mode === "login" ? "Log In" : "Sign Up";
  return (
    <>
      <Header />
      <main className="relative grid flex-1 place-items-center overflow-hidden px-4 py-16 sm:py-24">
        <Image src={bg} alt="" fill priority placeholder="blur" sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/25" aria-hidden />
        <div className="relative w-full max-w-[360px] rounded-lg bg-white/80 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          <h1 className="font-cc-display text-[40px] leading-none text-cc-ink">{title}</h1>
          <form onSubmit={submit} className="mt-6 grid gap-4" noValidate>
            {mode === "signup" ? (
              <>
                <Field label="First name*" error={errors.firstName}>
                  {(id, d) => <input id={id} aria-describedby={d} autoComplete="given-name" className={authInput} value={f.firstName} onChange={set("firstName")} maxLength={40} autoFocus />}
                </Field>
                <Field label="Last name" error={errors.lastName}>
                  {(id, d) => <input id={id} aria-describedby={d} autoComplete="family-name" className={authInput} value={f.lastName} onChange={set("lastName")} maxLength={40} />}
                </Field>
              </>
            ) : null}
            <Field label="Username*" error={errors.username} hint={mode === "signup" ? "Lowercase letters, numbers, dots or underscores" : undefined}>
              {(id, d) => (
                <input id={id} aria-describedby={d} autoComplete="username" autoCapitalize="none" spellCheck={false} className={authInput} value={f.username} onChange={set("username")} maxLength={30} autoFocus={mode === "login"} />
              )}
            </Field>
            <Field label="Password*" error={errors.password} hint={mode === "signup" ? "At least 8 characters" : undefined}>
              {(id, d) => (
                <input id={id} aria-describedby={d} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} className={authInput} value={f.password} onChange={set("password")} maxLength={200} />
              )}
            </Field>
            {formError ? (
              <p role="alert" className="bg-[#fdecea] px-3 py-2 text-sm font-semibold text-[#c0392b]">
                {formError}
              </p>
            ) : null}
            <Button type="submit" variant="dark" disabled={busy} className="justify-self-start rounded-none px-5">
              {busy ? "One moment…" : title}
            </Button>
          </form>
          <p className="mt-6 text-sm text-cc-text">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Link href={to(mode === "login" ? `/signup?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`)} className="font-semibold text-cc-accent hover:text-cc-accent-hover">
              {mode === "login" ? "Sign up here" : "Log in here"}
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
