import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopContent } from "@/components/shop-content";
import { ShopFallback } from "@/components/shop-view";
import { getStore } from "@/lib/store";

export async function generateStaticParams() {
  const { categories } = await getStore();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const { categories } = await getStore();
  const match = categories.find((c) => c.slug === category);
  return match
    ? { title: match.name, description: `${match.name} from Yokai Apparel.` }
    : { title: "Page not found" };
}

// The category check runs before any <Suspense> boundary, so an unknown
// category returns a real HTTP 404, not a streamed page with status 200.
export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const { categories } = await getStore();
  if (!categories.some((c) => c.slug === category)) notFound();

  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent category={category} searchParams={searchParams} />
    </Suspense>
  );
}
