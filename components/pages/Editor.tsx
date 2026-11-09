"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiError, call, resizeImage, useMe } from "../../lib/client";
import { CATEGORIES, type Category, type RecipeView } from "../../lib/types";
import { cx, imageUrl, to } from "../../lib/util";
import Header from "../Header";
import { Icon } from "../icons";
import { Button, CATEGORY_STYLE, Field, inputCls } from "../ui";

const TEMPLATE = "Ingredients\n- \n- \n- \n\nMethod\n1. \n2. \n3. ";

/** Used for both /new and /recipes/:id/edit. */
export default function Editor({ mode }: { mode: "new" | "edit" }) {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const { user, loaded } = useMe();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Baked");
  const [description, setDescription] = useState(mode === "new" ? TEMPLATE : "");
  const [image, setImage] = useState<string | null | "keep">(null); // data URL, "keep" existing, or null
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");

  // Send signed-out visitors to log in, then back here.
  useEffect(() => {
    if (loaded && !user) router.replace(to(`/login?next=${encodeURIComponent(mode === "new" ? "/new" : `/recipes/${params.id}/edit`)}`));
  }, [loaded, user, router, mode, params.id]);

  useEffect(() => {
    if (mode !== "edit" || !params.id || !user) return;
    call<{ recipe: RecipeView }>(`/recipes/${encodeURIComponent(params.id)}`)
      .then(({ recipe }) => {
        if (recipe.authorId !== user.id) {
          router.replace(to(`/recipes/${recipe.id}`));
          return;
        }
        setTitle(recipe.title);
        setCategory(recipe.category);
        setDescription(recipe.description);
        setExistingImage(recipe.imageId);
        setImage(recipe.imageId ? "keep" : null);
      })
      .catch(() => setFormError("This recipe couldn't be loaded."))
      .finally(() => setLoading(false));
  }, [mode, params.id, user, router]);

  async function pickPhoto(f: File | undefined) {
    if (!f) return;
    setErrors((e) => ({ ...e, image: "" }));
    try {
      setImage(await resizeImage(f));
    } catch (e) {
      setErrors((x) => ({ ...x, image: e instanceof Error ? e.message : "That photo didn't work" }));
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError("");
    try {
      const body = JSON.stringify({ title, category, description, image });
      const { recipe } =
        mode === "new"
          ? await call<{ recipe: RecipeView }>("/recipes", { method: "POST", body })
          : await call<{ recipe: RecipeView }>(`/recipes/${params.id}`, { method: "PUT", body });
      if (mode === "new") {
        // Next keeps visited pages alive in the background; start fresh next time.
        setTitle("");
        setCategory("Baked");
        setDescription(TEMPLATE);
        setImage(null);
      }
      setBusy(false);
      router.push(to(`/recipes/${recipe.id}`));
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields ?? {});
        setFormError(err.message);
      } else setFormError("Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  const preview = image === "keep" ? (existingImage ? imageUrl(existingImage) : null) : image;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 sm:px-8">
        <h1 className="mt-10 font-cc-display text-4xl sm:text-5xl">{mode === "new" ? "Share a recipe" : "Edit recipe"}</h1>
        <p className="mt-2 text-cc-muted">Plain text is fine: lines starting with “-” become a list, “1.” becomes numbered steps.</p>

        {loading ? (
          <div className="mt-8 h-96 animate-pulse rounded-[1.5rem] bg-cc-sunk" />
        ) : (
          <form onSubmit={save} className="mt-8 grid gap-6" noValidate>
            <Field label="Title" error={errors.title}>
              {(id, d) => <input id={id} aria-describedby={d} className={inputCls} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Grandma's mandazi" autoFocus />}
            </Field>

            <div>
              <p className="mb-2 text-[13px] font-semibold">How is it cooked?</p>
              <div role="radiogroup" aria-label="Cooking method" className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((c) => {
                  const Ic = Icon[CATEGORY_STYLE[c].icon];
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={category === c}
                      onClick={() => setCategory(c)}
                      className={cx(
                        "flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-sm font-semibold transition",
                        category === c ? "border-cc-accent bg-cc-accent-soft" : "border-cc-line bg-cc-card hover:border-cc-ink/30",
                      )}
                    >
                      <Ic className="size-6" /> {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold">Photo (optional)</p>
              <div className="grid gap-3 sm:grid-cols-[14rem_1fr] sm:items-center">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-cc-line bg-cc-card text-cc-muted hover:border-cc-accent"
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Recipe photo preview" className="size-full object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-sm font-semibold">
                      <Icon.Image className="size-7" /> Add a photo
                    </span>
                  )}
                </button>
                <div className="flex flex-wrap gap-2">
                  <Button icon="Image" onClick={() => fileRef.current?.click()}>
                    {preview ? "Change photo" : "Choose photo"}
                  </Button>
                  {preview ? (
                    <Button variant="ghost" icon="X" onClick={() => setImage(null)}>
                      Remove
                    </Button>
                  ) : null}
                  <p className="w-full text-xs text-cc-muted">Resized on your device before uploading, so big phone photos are fine.</p>
                  {errors.image ? <p className="w-full text-xs font-medium text-cc-accent">{errors.image}</p> : null}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
            </div>

            <Field label="Ingredients and method" error={errors.description}>
              {(id, d) => (
                <textarea
                  id={id}
                  aria-describedby={d}
                  rows={16}
                  value={description}
                  maxLength={12000}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cx(inputCls, "py-3 font-mono text-sm leading-relaxed")}
                />
              )}
            </Field>

            {formError ? (
              <p role="alert" className="rounded-xl bg-cc-accent-soft px-4 py-3 text-sm font-medium text-cc-accent">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Link href={mode === "edit" && params.id ? to(`/recipes/${params.id}`) : to("/")} className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-cc-muted hover:text-cc-ink">
                Cancel
              </Link>
              <Button type="submit" variant="primary" icon="Check" disabled={busy}>
                {busy ? "Saving…" : mode === "new" ? "Publish recipe" : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
