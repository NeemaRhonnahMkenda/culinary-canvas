import { z } from "zod";

export const CATEGORIES = ["Baked", "Boiled", "Fried"] as const;
export type Category = (typeof CATEGORIES)[number];

export const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;

export const SignupSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_RE, "3 to 30 characters: lowercase letters, numbers, dots or underscores"),
  firstName: z.string().trim().min(1, "Required").max(40),
  lastName: z.string().trim().max(40),
  password: z.string().min(8, "At least 8 characters").max(200),
});

export const LoginSchema = z.object({
  username: z.string().trim().toLowerCase().max(30),
  password: z.string().max(200),
});

/** An uploaded photo arrives as a JPEG/PNG/WebP data URL, already resized in the browser. */
export const MAX_IMAGE_CHARS = 700_000; // ~500 KB of image after base64
const dataUrl = z
  .string()
  .max(MAX_IMAGE_CHARS, "Photo is too large")
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, "Unsupported image");

export const RecipeInputSchema = z.object({
  title: z.string().trim().min(3, "Give it a title").max(120),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(20, "Add ingredients and steps").max(12_000),
  /** New photo (data URL), "keep" the current one, or null to remove it. */
  image: z.union([dataUrl, z.literal("keep"), z.null()]),
});

export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  passHash: string; // "scrypt$<salt hex>$<hash hex>", or "" for accounts that can't log in
  createdAt: string;
};

export type Recipe = {
  id: string;
  title: string;
  category: Category;
  description: string;
  imageId: string | null;
  /** Bundled photo for seeded recipes (key in lib/photos.ts). */
  photo?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

/** What the API sends to the browser: never includes password hashes. */
export type PublicUser = Pick<User, "id" | "username" | "firstName" | "lastName">;
export type RecipeView = Recipe & { author: PublicUser | null };
