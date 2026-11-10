"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiError, call, resizeImage, useMe } from "../../lib/client";
import { CATEGORIES, type Category, type RecipeView } from "../../lib/types";
import { cx, imageUrl, to } from "../../lib/util";
import Header from "../Header";
import { Icon } from "../icons";
import Footer from "../Footer";
import { Button, Field, container, inputCls } from "../ui";

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
      <main className={`${container} flex-1 pt-6 pb-20`}>
        <h1 className="font-cc-display text-[40px] leading-tight text-cc-ink sm:text-[52px]">{mode === "new" ? "Add a New Recipe" : "Edit Recipe"}</h1>

        {loading ? (
          <div className="mt-8 h-96 animate-pulse bg-cc-sunk" />
        ) : (
          <form onSubmit={save} className="mt-6 grid gap-7" noValidate>
            <Field label="Recipe title*" error={errors.title}>
              {(id, d) => <input id={id} aria-describedby={d} className={inputCls} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} autoFocus />}
            </Field>

            <div className="flex items-center gap-3">
              <label htmlFor="cc-category" className="text-sm">
                Category*
              </label>
              <select
                id="cc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="h-9 border border-[#9b9b9b] bg-white px-2 text-[15px] text-cc-ink outline-none focus:border-cc-accent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <Field label="Recipe description*" error={errors.description} hint="Lines starting with “-” become a list and “1.” becomes numbered steps.">
              {(id, d) => (
                <textarea
                  id={id}
                  aria-describedby={d}
                  rows={12}
                  value={description}
                  maxLength={12000}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cx(inputCls, "resize-y py-3 leading-relaxed")}
                />
              )}
            </Field>

            <div>
              <p className="mb-3 text-sm">Recipe image</p>
              <div className="flex flex-wrap items-center gap-4 border-b border-[#cfcfcf] pb-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="grid size-24 shrink-0 place-items-center overflow-hidden border border-dashed border-[#bdbdbd] bg-cc-sunk text-cc-muted hover:border-cc-accent"
                  aria-label={preview ? "Change photo" : "Choose photo"}
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Recipe photo preview" className="size-full object-cover" />
                  ) : (
                    <Icon.Image className="size-7" />
                  )}
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={() => fileRef.current?.click()} className="min-h-9 rounded-none px-4 text-sm">
                    {preview ? "Change file" : "Choose file"}
                  </Button>
                  {preview ? (
                    <button type="button" onClick={() => setImage(null)} className="text-sm underline-offset-4 hover:text-cc-accent hover:underline">
                      Remove
                    </button>
                  ) : (
                    <span className="text-sm text-cc-muted">No file chosen</span>
                  )}
                  <p className="w-full text-xs text-cc-muted">Optional. Big phone photos are resized on your device first. No photo? We&apos;ll use a default one.</p>
                  {errors.image ? <p className="w-full text-xs font-semibold text-[#c0392b]">{errors.image}</p> : null}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
            </div>

            {formError ? (
              <p role="alert" className="bg-[#fdecea] px-4 py-3 text-sm font-semibold text-[#c0392b]">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-5">
              <Button type="submit" variant="primary" disabled={busy} className="rounded-none">
                {busy ? "Saving…" : mode === "new" ? "Submit" : "Save changes"}
              </Button>
              <Link href={mode === "edit" && params.id ? to(`/recipes/${params.id}`) : to("/")} className="text-sm hover:text-cc-accent">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
