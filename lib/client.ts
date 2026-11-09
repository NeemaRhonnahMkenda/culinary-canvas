"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { PublicUser, RecipeView } from "./types";
import { api } from "./util";

/* ---------- who is signed in (shared across components) ---------- */

type Me = { user: PublicUser | null; persistent: boolean; loaded: boolean };
let me: Me = { user: null, persistent: true, loaded: false };
const subs = new Set<() => void>();
const emit = () => subs.forEach((s) => s());
let inflight: Promise<void> | null = null;

export function refreshMe() {
  inflight ??= fetch(api("/auth/me"), { cache: "no-store" })
    .then((r) => r.json())
    .then((j: { user: PublicUser | null; persistent: boolean }) => {
      me = { user: j.user, persistent: j.persistent, loaded: true };
    })
    .catch(() => {
      me = { ...me, loaded: true };
    })
    .finally(() => {
      inflight = null;
      emit();
    });
  return inflight;
}

export function setMe(user: PublicUser | null) {
  me = { ...me, user, loaded: true };
  emit();
}

export function useMe(): Me {
  const snap = useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => me,
    () => me,
  );
  useEffect(() => {
    if (!me.loaded) refreshMe();
  }, []);
  return snap;
}

/* ---------- API helpers ---------- */

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields?: Record<string, string>) {
    super(message);
  }
}

export async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(api(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(j.error ?? "Something went wrong", res.status, j.fields);
  return j as T;
}

export const getRecipes = (params: Record<string, string>) =>
  call<{ recipes: RecipeView[] }>(`/recipes?${new URLSearchParams(params)}`);

/* ---------- photos: resized in the browser before upload ---------- */

/** Downscale to at most `max` px and re-encode as JPEG, so uploads stay small (~150 to 300 KB). */
export async function resizeImage(file: File, max = 1400): Promise<string> {
  if (!/^image\/(jpeg|png|webp|heic|heif|gif)$/.test(file.type) && !file.type.startsWith("image/")) {
    throw new Error("Please choose a photo (JPEG, PNG or WebP)");
  }
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That photo couldn't be read. Try a JPEG or PNG.");
  });
  for (const [size, quality] of [
    [max, 0.82],
    [1100, 0.75],
    [900, 0.7],
  ] as const) {
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", quality);
    if (url.length < 650_000) return url;
  }
  throw new Error("That photo is too large even after resizing.");
}
