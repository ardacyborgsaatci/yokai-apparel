import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { PurchasePanel } from "@/components/purchase-panel";
import { formatPrice } from "@/lib/format";
import { getStore } from "@/lib/store";

export async function generateStaticParams() {
  const { products } = await getStore();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getStore();
  const product = products.find((p) => p.slug === slug);
  return product
    ? { title: product.name, description: product.description }
    : { title: "Product not found" };
}

// The product check runs before any <Suspense> boundary, so an unknown slug
// returns a real HTTP 404, not a streamed page with status 200.
export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const { products } = await getStore();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <div className="wrap pb-8 pt-8 md:pt-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/shop" className="inline-flex min-h-11 items-center transition-colors hover:text-bone hover:underline active:text-bone active:underline active:duration-0">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/shop/${product.category.slug}`}
              className="inline-flex min-h-11 items-center transition-colors hover:text-bone hover:underline active:text-bone active:underline active:duration-0"
            >
              {product.category.name}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery images={product.images} />
        <div className="lg:pt-4">
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="display mt-2 text-5xl sm:text-6xl">{product.name}</h1>
          {product.name_ja && (
            <p lang="ja" className="font-jp mt-3 text-sm font-medium text-muted">
              {product.name_ja}
            </p>
          )}
          <p className="mt-4 text-2xl font-semibold">
            {formatPrice(product.price_cents)}
          </p>
          <p className="mt-6 max-w-prose text-muted">{product.description}</p>
          <div className="mt-10">
            <PurchasePanel
              slug={product.slug}
              name={product.name}
              priceCents={product.price_cents}
              image={product.images[0]?.path ?? null}
              variants={product.variants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
