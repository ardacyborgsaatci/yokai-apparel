import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm, type ProductFormData } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { CLOTHING_SIZES, ONE_SIZE } from "@/lib/catalog";
import { requireAdmin } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "New product" };

// A new product starts with empty fields, "Visible in store" off, clothing
// sizes with stock 0, and both image slots empty (DESIGN.md 7.3).
const EMPTY: ProductFormData = {
  id: null,
  slug: "",
  name: "",
  nameJa: "",
  categoryId: "",
  price: "",
  description: "",
  isActive: false,
  sizeType: "clothing",
  stock: Object.fromEntries([...CLOTHING_SIZES, ONE_SIZE].map((size) => [size, "0"])),
  images: [null, null],
};

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort");
  if (error) throw new Error(`Could not load categories: ${error.message}`);

  return (
    <div className="max-w-2xl min-w-0">
      <Button asChild variant="link" className="-ml-3">
        <Link href="/admin/products">
          <ArrowLeft aria-hidden="true" />
          All products
        </Link>
      </Button>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">
        New product
      </h1>
      <ProductForm data={EMPTY} categories={data ?? []} />
    </div>
  );
}
