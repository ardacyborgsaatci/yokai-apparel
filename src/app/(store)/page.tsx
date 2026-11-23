import Image from "next/image";
import Link from "next/link";
import { HeroLayers } from "@/components/hero-layers";
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
      <section className="hero relative isolate flex min-h-[34rem] items-end overflow-hidden md:min-h-[42rem]">
        <HeroLayers />
        <div className="wrap relative pb-14 pt-32 md:pb-20">
          <p className="eyebrow">Streetwear for the night</p>
          <h1 className="display mt-4 text-6xl sm:text-8xl lg:text-9xl">
            <span className="block">Wear the</span>{" "}
            <span className="block">unseen</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-bone/90 sm:text-lg">
            Black, off-white and one flame of red. Tees, hoodies and
            accessories named for the spirits of Japanese folklore.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="display tactile tactile-red inline-flex min-h-12 items-center rounded-lg bg-red px-8 text-lg text-bone transition hover:bg-bone hover:text-ink hover:tactile-bone active:bg-bone active:text-ink active:tactile-bone active:duration-0"
            >
              Shop all
            </Link>
            <Link
              href="/about"
              className="display tactile inline-flex min-h-12 items-center rounded-lg border border-bone bg-surface px-8 text-lg text-bone transition hover:bg-raised active:bg-raised active:duration-0"
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
            className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-widest transition-colors hover:underline active:underline active:duration-0"
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
                  className="group relative isolate block aspect-[4/3] overflow-hidden rounded-xl bg-surface md:aspect-[4/5]"
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
