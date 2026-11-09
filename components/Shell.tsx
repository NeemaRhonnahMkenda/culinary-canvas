import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import { Suspense } from "react";

const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", weight: "400", subsets: ["latin"] });

export const ccMetadata: Metadata = {
  title: { default: "Culinary Canvas · Share your recipes", template: "%s · Culinary Canvas" },
  description: "A recipe-sharing blog: sign up, post recipes with photos, browse by cooking method and search.",
};

function Loading() {
  return (
    <div className="grid flex-1 place-items-center py-32" aria-busy="true">
      <div className="size-10 animate-spin rounded-full border-4 border-cc-line border-t-cc-accent" aria-label="Loading" />
    </div>
  );
}

/**
 * Wraps every Culinary Canvas page, standalone or embedded in the portfolio.
 * Hosts must import styles/theme.css (Tailwind tokens) and styles/culinary.css.
 */
export default function CulinaryShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`cc ${dmSerif.variable} flex min-h-full flex-1 flex-col font-sans`}>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  );
}
