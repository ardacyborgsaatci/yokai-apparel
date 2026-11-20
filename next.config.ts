import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Off on purpose. With it on, the first visit to an unknown /products/[slug]
  // or /shop/[category] gets the shared shell first, so the status is 200
  // (a soft 404). With it off, notFound() runs before streaming and returns 404.
  partialPrefetching: false,
  // Admin uploads are public files in Supabase Storage. Seed photos stay in /public/images.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ygswejriotytjzykteyc.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
    ],
  },
  // One image goes in each upload request (2 MB, plus room for the multipart body).
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
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
