"use client";

import { Warning } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ONE_SIZE, type Variant } from "@/lib/catalog";

const sizeId = (size: string) => `size-${size.replace(/\s+/g, "-").toLowerCase()}`;

// Size picker and the Add to cart button.
export function PurchasePanel({
  slug,
  name,
  priceCents,
  image,
  variants,
}: {
  slug: string;
  name: string;
  priceCents: number;
  image: string | null;
  variants: Variant[];
}) {
  const { add, openDrawer } = useCart();
  const onlyOneSize =
    variants.length === 1 && variants[0].size === ONE_SIZE && variants[0].stock > 0;
  const [selected, setSelected] = useState<string | null>(
    onlyOneSize ? ONE_SIZE : null,
  );
  const [showError, setShowError] = useState(false);

  // The cart lives in the browser, so adding is instant: no busy state.
  function onAdd(event: React.MouseEvent<HTMLButtonElement>) {
    if (!selected) {
      setShowError(true);
      const first = variants.find((variant) => variant.stock > 0);
      if (first) document.getElementById(sizeId(first.size))?.focus();
      return;
    }
    const variant = variants.find((item) => item.size === selected);
    if (!variant) return;
    add({
      slug,
      size: variant.size,
      name,
      priceCents,
      image,
      max: variant.stock,
    });
    openDrawer(event.currentTarget);
  }

  return (
    <div>
      <fieldset aria-describedby={showError ? "size-error" : undefined}>
        <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Size
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {variants.map((variant) => {
            const soldOut = variant.stock <= 0;
            const id = sizeId(variant.size);
            return (
              <div key={variant.size}>
                <input
                  type="radio"
                  name="size"
                  id={id}
                  value={variant.size}
                  disabled={soldOut}
                  checked={selected === variant.size}
                  onChange={() => {
                    setSelected(variant.size);
                    setShowError(false);
                  }}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className="tactile flex min-h-14 min-w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-muted bg-surface px-4 py-2 text-sm font-semibold transition hover:border-bone active:border-bone active:bg-raised active:duration-0 peer-checked:tactile-bone peer-checked:border-bone peer-checked:bg-bone peer-checked:text-ink peer-checked:active:border-bone peer-checked:active:bg-bone peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-bone peer-disabled:cursor-not-allowed peer-disabled:border-dashed peer-disabled:text-muted peer-disabled:hover:border-muted peer-disabled:active:border-muted peer-disabled:active:bg-surface peer-disabled:shadow-none peer-disabled:active:transform-none"
                >
                  <span className={soldOut ? "line-through" : undefined}>
                    {variant.size}
                  </span>
                  {soldOut && (
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Sold out
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
        {showError && (
          <p
            id="size-error"
            role="alert"
            className="mt-3 flex items-start gap-2 text-sm text-error"
          >
            <Warning size={20} aria-hidden="true" className="shrink-0" />
            Choose a size.
          </p>
        )}
      </fieldset>

      <button
        type="button"
        onClick={onAdd}
        className="display mt-8 flex min-h-14 w-full items-center justify-center tactile tactile-red rounded-lg bg-red px-8 text-xl text-bone transition hover:bg-bone hover:text-ink hover:tactile-bone active:bg-bone active:text-ink active:tactile-bone active:duration-0"
      >
        Add to cart
      </button>

      <p className="mt-4 text-sm text-muted">
        Free shipping on orders of $100 or more. Otherwise a flat $6.00.{" "}
        <Link href="/shipping" className="text-bone underline underline-offset-4 transition-colors hover:decoration-2 active:decoration-2 active:duration-0">
          Shipping &amp; Returns
        </Link>
      </p>
    </div>
  );
}
