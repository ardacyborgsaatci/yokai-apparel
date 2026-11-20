"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase";
import { sizeRank, type Category, type Product } from "@/lib/catalog";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  name_ja: string | null;
  description: string;
  price_cents: number;
  created_at: string;
  categories: { slug: string; name: string } | null;
  product_images: Product["images"];
  product_variants: Product["variants"];
};

// One cached read for the whole catalog (12 products). Tag "catalog" lets a
// later phase refresh it on demand after admin edits or orders.
export async function getStore(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  cacheLife("hours");
  cacheTag("catalog");

  const supabase = createPublicClient();
  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from("categories").select("id, slug, name, sort").order("sort"),
    supabase
      .from("products")
      .select(
        "id, slug, name, name_ja, description, price_cents, created_at, categories(slug, name), product_images(path, alt, sort, credit_name, credit_url), product_variants(size, stock)",
      )
      .eq("is_active", true),
  ]);

  if (categoriesRes.error) {
    throw new Error(`Could not load categories: ${categoriesRes.error.message}`);
  }
  if (productsRes.error) {
    throw new Error(`Could not load products: ${productsRes.error.message}`);
  }

  const rows = productsRes.data as unknown as ProductRow[];
  const products: Product[] = rows
    .filter((row) => row.categories)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      name_ja: row.name_ja,
      description: row.description,
      price_cents: row.price_cents,
      created_at: row.created_at,
      category: row.categories as { slug: string; name: string },
      images: [...row.product_images].sort((a, b) => a.sort - b.sort),
      variants: [...row.product_variants].sort(
        (a, b) => sizeRank(a.size) - sizeRank(b.size),
      ),
    }));

  return { categories: categoriesRes.data as Category[], products };
}
