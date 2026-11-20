import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { filterProducts } from "@/lib/catalog";
import { getStore } from "@/lib/store";

const FEATURED_COUNT = 4;

export default async function HomePage() {
  const { categories, products } = await getStore();
  const newest = filterProducts(products, { sort: "newest" });
  const featured = newest.slice(0, FEATURED_COUNT);

  return (
    <>
      <section className="relative isolate flex min-h-[34rem] items-end overflow-hidden md:min-h-[42rem]">
        <Image
          src="/images/hero-dark-street.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/60 to-transparent"
        />
        <span
          aria-hidden="true"
          lang="ja"
          className="display absolute right-4 top-6 -z-10 text-6xl text-vermilion [writing-mode:vertical-rl] sm:right-8 sm:text-8xl"
        >
          妖怪
        </span>
        <div className="wrap pb-14 pt-32 md:pb-20">
          <p className="eyebrow animate-rise">Streetwear for the night</p>
          <h1
            className="display animate-rise mt-4 text-6xl sm:text-8xl lg:text-9xl"
            style={{ animationDelay: "80ms" }}
          >
            <span className="block">Wear the</span>{" "}
            <span className="block">unseen</span>
          </h1>
          <p
            className="animate-rise mt-6 max-w-md text-base text-bone/90 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Black, off-white and one flame of vermilion. Tees, hoodies and
            accessories named for the spirits of Japanese folklore.
          </p>
          <div
            className="animate-rise mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/shop"
              className="display inline-flex min-h-12 items-center bg-vermilion px-8 text-lg text-ink transition-colors hover:bg-bone"
            >
              Shop all
            </Link>
            <Link
              href="/about"
              className="display inline-flex min-h-12 items-center border border-bone px-8 text-lg text-bone transition-colors hover:border-vermilion hover:text-vermilion"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="wrap pt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">New this season</p>
            <h2 id="featured-heading" className="display mt-2 text-4xl sm:text-5xl">
              Featured
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-widest hover:text-vermilion"
          >
            View all
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {featured.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="categories-heading" className="wrap pt-24">
        <p className="eyebrow">Browse</p>
        <h2 id="categories-heading" className="display mt-2 text-4xl sm:text-5xl">
          Categories
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {categories.map((category) => {
            const inCategory = newest.filter(
              (p) => p.category.slug === category.slug,
            );
            const image = inCategory.find((p) => p.images.length > 0)?.images[0];
            return (
              <li key={category.id}>
                <Link
                  href={`/shop/${category.slug}`}
                  className="group relative isolate block aspect-[4/3] overflow-hidden bg-surface md:aspect-[4/5]"
                >
                  {image ? (
                    <Image
                      src={image.path}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                    <span className="display text-4xl">{category.name}</span>
                    <span className="text-sm text-bone">
                      {inCategory.length} items
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
