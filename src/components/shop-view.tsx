import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ShopControls } from "@/components/shop-controls";
import {
  filterProducts,
  shopHref,
  type Category,
  type Product,
  type ShopFilters,
} from "@/lib/catalog";

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold tactile transition active:duration-0 ${
        active
          ? "tactile-bone border-bone bg-bone text-ink"
          : "border-muted bg-surface text-bone hover:border-bone active:border-bone active:bg-raised"
      }`}
    >
      {children}
    </Link>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function ShopView({
  categories,
  products,
  filters,
}: {
  categories: Category[];
  products: Product[];
  filters: ShopFilters;
}) {
  const { category, size, sort } = filters;
  const active = categories.find((c) => c.slug === category);
  const visible = filterProducts(products, filters);

  return (
    <div className="wrap pb-8 pt-12 md:pt-16">
      <p className="eyebrow">Shop</p>
      <h1 className="display mt-2 text-5xl sm:text-7xl">
        {active ? active.name : "All products"}
      </h1>

      <div className="mt-8 grid gap-6 border-y border-line py-6 lg:grid-cols-[auto_1fr_auto] lg:gap-10">
        <FilterGroup label="Category">
          <Chip href={shopHref(undefined, { size, sort })} active={!category}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.id}
              href={shopHref(c.slug, { size, sort })}
              active={category === c.slug}
            >
              {c.name}
            </Chip>
          ))}
        </FilterGroup>

        <ShopControls category={category} size={size} sort={sort} />
      </div>

      <p className="mt-6 text-sm text-muted" role="status">
        {visible.length} {visible.length === 1 ? "product" : "products"}
        {size ? ` in size ${size}` : ""}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-line p-8">
          <p className="display text-3xl">Nothing here</p>
          <p className="mt-3 max-w-md text-muted">
            No product matches these filters. Try another size or category.
          </p>
          <Link
            href="/shop"
            className="display mt-6 inline-flex min-h-12 items-center tactile tactile-red rounded-lg bg-red px-8 text-lg text-bone transition hover:bg-bone hover:text-ink hover:tactile-bone active:bg-bone active:text-ink active:tactile-bone active:duration-0"
          >
            Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}

// Suspense fallback: a plain block, no shimmer, no fake shapes.
// Heights match the loaded "All products" page: 2500px at 375, 2100px at 768,
// 1764px from 1024 (measured).
export function ShopFallback() {
  return <div aria-hidden="true" className="h-625 md:h-525 lg:h-441" />;
}
