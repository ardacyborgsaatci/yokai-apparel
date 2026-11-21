import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DeleteProduct } from "@/components/admin/delete-product";
import { ProductForm, type ProductFormData } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { CLOTHING_SIZES, ONE_SIZE } from "@/lib/catalog";
import { requireAdmin } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "Edit product" };

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  name_ja: string | null;
  description: string;
  price_cents: number;
  category_id: number;
  is_active: boolean;
  product_images: {
    path: string;
    alt: string;
    sort: number;
    credit_name: string | null;
    credit_url: string | null;
  }[];
  product_variants: { size: string; stock: number }[];
};

// One sample id, so the proxy can rewrite an unknown id to a prerendered 404
// (see src/proxy.ts). "sample" is not a number: the page calls notFound() for
// it at build time, before any session or database call. Real ids render on request.
export function generateStaticParams() {
  return [{ id: "sample" }];
}

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!/^\d{1,15}$/.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const [productRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, name_ja, description, price_cents, category_id, is_active, product_images(path, alt, sort, credit_name, credit_url), product_variants(size, stock)",
      )
      .eq("id", Number(id))
      .maybeSingle(),
    supabase.from("categories").select("id, name").order("sort"),
  ]);
  if (productRes.error) {
    throw new Error(`Could not load the product: ${productRes.error.message}`);
  }
  if (categoriesRes.error) {
    throw new Error(`Could not load categories: ${categoriesRes.error.message}`);
  }
  const product = productRes.data as ProductRow | null;
  if (!product) notFound();

  const slot = (sort: number) => {
    const image = product.product_images.find((item) => item.sort === sort);
    return image
      ? {
          path: image.path,
          alt: image.alt,
          creditName: image.credit_name ?? "",
          creditUrl: image.credit_url ?? "",
        }
      : null;
  };

  // Both sets of stock start at 0. The saved sizes fill their own rows.
  const stock = Object.fromEntries(
    [...CLOTHING_SIZES, ONE_SIZE].map((size) => [size, "0"]),
  );
  for (const variant of product.product_variants) {
    stock[variant.size] = String(variant.stock);
  }

  const data: ProductFormData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    nameJa: product.name_ja ?? "",
    categoryId: String(product.category_id),
    price: (product.price_cents / 100).toFixed(2),
    description: product.description,
    isActive: product.is_active,
    sizeType: product.product_variants.some((v) => v.size === ONE_SIZE)
      ? "one"
      : "clothing",
    stock,
    images: [slot(0), slot(1)],
  };

  return (
    <div className="max-w-2xl min-w-0">
      <Button asChild variant="link" className="-ml-3">
        <Link href="/admin/products">
          <ArrowLeft aria-hidden="true" />
          All products
        </Link>
      </Button>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">
        Edit {product.name}
      </h1>
      <ProductForm data={data} categories={categoriesRes.data ?? []} />
      <DeleteProduct id={product.id} name={product.name} />
    </div>
  );
}
