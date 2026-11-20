import Image from "next/image";
import Link from "next/link";
import { isSoldOut, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const image = product.images[0];
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {image ? (
          <Image
            src={image.path}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {isSoldOut(product) && (
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-xs font-semibold uppercase tracking-widest text-bone">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="display text-lg group-hover:text-vermilion">
          {product.name}
        </span>
        <span className="text-sm font-semibold text-bone">
          {formatPrice(product.price_cents)}
        </span>
      </div>
      {product.name_ja && (
        <span lang="ja" className="font-jp block text-sm font-medium text-muted">
          {product.name_ja}
        </span>
      )}
    </Link>
  );
}
