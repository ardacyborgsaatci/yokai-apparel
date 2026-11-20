"use client";

import Link from "next/link";
import { useState } from "react";
import { ONE_SIZE, type Variant } from "@/lib/catalog";

// Size picker and the Add to cart button. The button has no action yet
// (the cart arrives in the next phase).
export function PurchasePanel({ variants }: { variants: Variant[] }) {
  const onlyOneSize =
    variants.length === 1 && variants[0].size === ONE_SIZE && variants[0].stock > 0;
  const [selected, setSelected] = useState<string | null>(
    onlyOneSize ? ONE_SIZE : null,
  );

  return (
    <div>
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Size
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {variants.map((variant) => {
            const soldOut = variant.stock <= 0;
            const id = `size-${variant.size.replace(/\s+/g, "-").toLowerCase()}`;
            return (
              <div key={variant.size}>
                <input
                  type="radio"
                  name="size"
                  id={id}
                  value={variant.size}
                  disabled={soldOut}
                  checked={selected === variant.size}
                  onChange={() => setSelected(variant.size)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className="flex min-h-14 min-w-16 cursor-pointer flex-col items-center justify-center border border-muted px-4 py-2 text-sm font-semibold transition-colors hover:border-bone peer-checked:border-bone peer-checked:bg-bone peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-vermilion peer-disabled:cursor-not-allowed peer-disabled:border-dashed peer-disabled:text-muted peer-disabled:hover:border-muted"
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
      </fieldset>

      <button
        type="button"
        className="display mt-8 flex min-h-14 w-full items-center justify-center bg-vermilion px-8 text-xl text-ink transition-colors hover:bg-bone"
      >
        Add to cart
      </button>

      <p className="mt-4 text-sm text-muted">
        Free shipping on orders of $100 or more. Otherwise a flat $6.00.{" "}
        <Link href="/shipping" className="text-bone underline underline-offset-4 hover:text-vermilion">
          Shipping &amp; Returns
        </Link>
      </p>
    </div>
  );
}
