"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApiError, call, setMe } from "../../lib/client";
import type { PublicUser } from "../../lib/types";
import { to } from "../../lib/util";
import Header from "../Header";
import { Button, Field, inputCls } from "../ui";

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

  return (
    <>
      <Header />
      <main className="grid flex-1 place-items-center px-4 py-12">
        <div className="w-full max-w-md rounded-[1.75rem] border border-cc-line bg-cc-card p-6 shadow-sm sm:p-8">
          <h1 className="font-cc-display text-4xl">{mode === "login" ? "Welcome back" : "Join the kitchen"}</h1>
          <p className="mt-1 text-cc-muted">{mode === "login" ? "Log in to share and edit your recipes." : "Create an account to share your recipes."}</p>
          <form onSubmit={submit} className="mt-6 grid gap-4" noValidate>
            {mode === "signup" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" error={errors.firstName}>
                  {(id, d) => <input id={id} aria-describedby={d} autoComplete="given-name" className={inputCls} value={f.firstName} onChange={set("firstName")} maxLength={40} />}
                </Field>
                <Field label="Last name" error={errors.lastName}>
                  {(id, d) => <input id={id} aria-describedby={d} autoComplete="family-name" className={inputCls} value={f.lastName} onChange={set("lastName")} maxLength={40} />}
                </Field>
              </div>
            ) : null}
            <Field label="Username" error={errors.username} hint={mode === "signup" ? "Lowercase letters, numbers, dots or underscores" : undefined}>
              {(id, d) => (
                <input id={id} aria-describedby={d} autoComplete="username" autoCapitalize="none" spellCheck={false} className={inputCls} value={f.username} onChange={set("username")} maxLength={30} autoFocus />
              )}
            </Field>
            <Field label="Password" error={errors.password} hint={mode === "signup" ? "At least 8 characters" : undefined}>
              {(id, d) => (
                <input id={id} aria-describedby={d} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} className={inputCls} value={f.password} onChange={set("password")} maxLength={200} />
              )}
            </Field>
            {formError ? (
              <p role="alert" className="rounded-xl bg-cc-accent-soft px-4 py-3 text-sm font-medium text-cc-accent">
                {formError}
              </p>
            ) : null}
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? "One moment…" : mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-cc-muted">
            {mode === "login" ? "New here? " : "Already have an account? "}
            <Link href={to(mode === "login" ? `/signup?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`)} className="font-semibold text-cc-accent hover:underline">
              {mode === "login" ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
