import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Off on purpose. With it on, the first visit to an unknown /products/[slug]
  // or /shop/[category] gets the shared shell first, so the status is 200
  // (a soft 404). With it off, notFound() runs before streaming and returns 404.
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
