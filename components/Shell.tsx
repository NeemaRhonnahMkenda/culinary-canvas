import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";

const openSans = Open_Sans({ variable: "--font-open-sans", weight: ["300", "400", "600", "700"], style: ["normal", "italic"], subsets: ["latin"] });
// The original site's heading face, bundled so it works offline and in the portfolio.
const hanskendrick = localFont({ src: "../assets/fonts/hanskendrick.woff2", variable: "--font-hanskendrick", display: "swap" });

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
    <div className={`cc ${openSans.variable} ${hanskendrick.variable} flex min-h-full flex-1 flex-col`}>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  );
}
