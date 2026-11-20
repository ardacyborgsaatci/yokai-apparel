// Catalog types and pure helpers. No data access here: see store.ts.

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export const ONE_SIZE = "One Size";
export const SIZE_FILTERS: readonly string[] = [...CLOTHING_SIZES, ONE_SIZE];

export type SortKey = "newest" | "price-asc" | "price-desc";

export const SORT_OPTIONS: readonly { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

export type Category = {
  id: number;
  slug: string;
  name: string;
  sort: number;
};

export type ProductImage = {
  path: string;
  alt: string;
  sort: number;
  credit_name: string | null;
  credit_url: string | null;
};

export type Variant = {
  size: string;
  stock: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  name_ja: string | null;
  description: string;
  price_cents: number;
  created_at: string;
  category: { slug: string; name: string };
  images: ProductImage[];
  variants: Variant[];
};

export type ShopFilters = {
  category?: string;
  size?: string;
  sort: SortKey;
};

export function sizeRank(size: string): number {
  const index = SIZE_FILTERS.indexOf(size);
  return index === -1 ? SIZE_FILTERS.length : index;
}

// A product with no variants has nothing to buy, so it counts as sold out.
export function isSoldOut(product: Product): boolean {
  return product.variants.every((v) => v.stock <= 0);
}

export function parseShopParams(
  sp: Record<string, string | string[] | undefined>,
): Pick<ShopFilters, "size" | "sort"> {
  const rawSize = Array.isArray(sp.size) ? sp.size[0] : sp.size;
  const rawSort = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const size = rawSize && SIZE_FILTERS.includes(rawSize) ? rawSize : undefined;
  const sort = SORT_OPTIONS.find((o) => o.key === rawSort)?.key ?? "newest";
  return { size, sort };
}

// A product matches a size filter when that size is in stock.
export function filterProducts(
  products: Product[],
  { category, size, sort }: ShopFilters,
): Product[] {
  const list = products.filter(
    (p) =>
      (!category || p.category.slug === category) &&
      (!size || p.variants.some((v) => v.size === size && v.stock > 0)),
  );
  return list.sort((a, b) => {
    if (sort === "price-asc") return a.price_cents - b.price_cents;
    if (sort === "price-desc") return b.price_cents - a.price_cents;
    return Date.parse(b.created_at) - Date.parse(a.created_at);
  });
}

// Builds a shop URL. Default values are left out of the query string.
export function shopHref(
  category: string | undefined,
  { size, sort }: Pick<ShopFilters, "size" | "sort">,
): string {
  const params = new URLSearchParams();
  if (size) params.set("size", size);
  if (sort !== "newest") params.set("sort", sort);
  const query = params.toString();
  const path = category ? `/shop/${category}` : "/shop";
  return query ? `${path}?${query}` : path;
}
