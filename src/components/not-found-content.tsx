import Link from "next/link";

// The 404 text and links. The root not-found page adds the store frame around
// it. The (store) not-found page does not, because the store layout already has it.
export function NotFoundContent() {
  return (
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
          className="display inline-flex min-h-12 items-center tactile tactile-red rounded-lg bg-red px-8 text-lg text-bone transition hover:bg-bone hover:text-ink hover:tactile-bone active:bg-bone active:text-ink active:tactile-bone active:duration-0"
        >
          Shop all
        </Link>
        <Link
          href="/"
          className="display inline-flex min-h-12 items-center tactile rounded-lg border border-bone bg-surface px-8 text-lg text-bone transition hover:bg-raised active:bg-raised active:duration-0"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
