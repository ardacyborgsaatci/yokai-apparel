import { ShopView } from "@/components/shop-view";
import { parseShopParams } from "@/lib/catalog";
import { getStore } from "@/lib/store";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Reads search params (request data), so render it inside <Suspense>.
// The caller checks the category first, so an unknown one never gets here.
export async function ShopContent({
  category,
  searchParams,
}: {
  category?: string;
  searchParams: SearchParams;
}) {
  const { size, sort } = parseShopParams(await searchParams);
  const { categories, products } = await getStore();

  return (
    <ShopView
      categories={categories}
      products={products}
      filters={{ category, size, sort }}
    />
  );
}
