import type { Metadata } from "next";
import Link from "next/link";
import { StoreChrome } from "@/components/store-chrome";

export const metadata: Metadata = {
  title: "Page not found",
};

// The root layout has no store frame, so this page adds it. It answers every
// notFound() call and every address that matches no page, in the store and in
// the admin.
export default function NotFound() {
  return (
    <StoreChrome>
      <div className="wrap flex min-h-[60vh] flex-col items-start justify-center py-16">
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-2 text-7xl sm:text-9xl">Lost spirit</h1>
        <p className="mt-6 max-w-md text-lg text-bone/90">
          This page wandered off into the night. Try the shop, or head back
          home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="display inline-flex min-h-12 items-center bg-vermilion px-8 text-lg text-ink transition-colors hover:bg-bone active:bg-bone active:duration-0"
          >
            Shop all
          </Link>
          <Link
            href="/"
            className="display inline-flex min-h-12 items-center border border-bone px-8 text-lg text-bone transition-colors hover:border-vermilion hover:text-vermilion active:border-vermilion active:text-vermilion active:duration-0"
          >
            Home
          </Link>
        </div>
      </div>
    </StoreChrome>
  );
}
