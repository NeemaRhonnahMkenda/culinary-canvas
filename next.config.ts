import type { NextConfig } from "next";

/**
 * Standalone: served under /culinary-canvas (the same path the portfolio uses),
 * so links and cookies behave identically in both places.
 */
const basePath = "/culinary-canvas";

const nextConfig: NextConfig = {
  basePath,
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    NEXT_PUBLIC_CC_BASE: basePath,
    NEXT_PUBLIC_CC_ROUTE_PREFIX: "", // basePath already prefixes <Link>/router paths
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: basePath, basePath: false, permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      { source: "/api/:path((?!images).*)", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
