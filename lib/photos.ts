import type { StaticImageData } from "next/image";
import bolognese from "../assets/photos/bolognese.jpg";
import chapati from "../assets/photos/chapati.jpg";
import cheesecake from "../assets/photos/cheesecake.jpg";
import chickenKiev from "../assets/photos/chicken-kiev.jpg";
import chips from "../assets/photos/chips.jpg";
import cookies from "../assets/photos/cookies.jpg";
import crabCakes from "../assets/photos/crab-cakes.jpg";
import creamySpaghetti from "../assets/photos/creamy-spaghetti.jpg";
import fallback from "../assets/photos/default.jpg";
import roastChicken from "../assets/photos/roast-chicken.jpg";
import seafoodBoil from "../assets/photos/seafood-boil.jpg";
import steak from "../assets/photos/steak.jpg";
import sweetPotatoPie from "../assets/photos/sweet-potato-pie.jpg";

/**
 * Photos for the seeded recipes, bundled with the app (no database needed).
 * To swap a photo, replace the file in assets/photos/ and keep the same name.
 */
export const PHOTOS: Record<string, StaticImageData> = {
  bolognese,
  chapati,
  cheesecake,
  "chicken-kiev": chickenKiev,
  chips,
  cookies,
  "crab-cakes": crabCakes,
  "creamy-spaghetti": creamySpaghetti,
  "roast-chicken": roastChicken,
  "seafood-boil": seafoodBoil,
  steak,
  "sweet-potato-pie": sweetPotatoPie,
};

/** Shown when a recipe has no photo, like the original site's default image. */
export const DEFAULT_PHOTO = fallback;
