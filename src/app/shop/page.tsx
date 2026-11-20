import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopContent } from "@/components/shop-content";
import { ShopFallback } from "@/components/shop-view";

export const metadata: Metadata = {
  title: "Shop",
  description: "Tees, hoodies and accessories from Yokai Apparel.",
};

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}
