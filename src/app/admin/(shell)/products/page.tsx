import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stockText } from "@/lib/admin-format";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "Products" };

type ProductRow = {
  id: number;
  name: string;
  name_ja: string | null;
  price_cents: number;
  is_active: boolean;
  categories: { name: string } | null;
  product_images: { path: string; sort: number }[];
  product_variants: { size: string; stock: number }[];
};

export default async function ProductsPage() {
  // The session client reads hidden products too (admin policy). The store
  // query (getStore) hides them, so the admin list does not use it.
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, name_ja, price_cents, is_active, categories(name), product_images(path, sort), product_variants(size, stock)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load products: ${error.message}`);
  const products = (data ?? []) as unknown as ProductRow[];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus aria-hidden="true" />
            Add product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 rounded-lg border p-8 text-muted-foreground">
          No products yet.
        </p>
      ) : (
        <div className="mt-6 min-w-0 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-0">
                  <span className="sr-only">Photo</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const first = [...product.product_images].sort(
                  (a, b) => a.sort - b.sort,
                )[0];
                return (
                  <TableRow key={product.id}>
                    <TableCell className="pr-0">
                      {first ? (
                        <Image
                          src={first.path}
                          alt=""
                          width={40}
                          height={50}
                          sizes="40px"
                          className="h-[50px] w-10 max-w-none rounded-sm object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="h-[50px] w-10 rounded-sm bg-secondary"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium underline underline-offset-4"
                      >
                        {product.name}
                      </Link>
                      {product.name_ja ? (
                        <div
                          lang="ja"
                          className="font-jp text-sm text-muted-foreground"
                        >
                          {product.name_ja}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>{product.categories?.name ?? ""}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(product.price_cents)}
                    </TableCell>
                    <TableCell>{stockText(product.product_variants)}</TableCell>
                    <TableCell>
                      {product.is_active ? (
                        <Badge variant="secondary">Visible</Badge>
                      ) : (
                        <Badge variant="outline">Hidden</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
