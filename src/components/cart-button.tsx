"use client";

import { ShoppingCart } from "@phosphor-icons/react";
import { useCart } from "@/components/cart-provider";

// Header cart: icon and item count. It opens the cart drawer.
export function CartButton({ className = "" }: { className?: string }) {
  const { count, openDrawer } = useCart();
  const name =
    count === 0 ? "Cart, empty" : `Cart, ${count} ${count === 1 ? "item" : "items"}`;
  return (
    <button
      id="cart-button"
      type="button"
      aria-label={name}
      aria-haspopup="dialog"
      onClick={(event) => openDrawer(event.currentTarget)}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center border border-muted text-bone transition-colors hover:border-bone ${className}`}
    >
      <ShoppingCart size={24} aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center bg-vermilion px-1 text-xs font-semibold text-ink"
        >
          {count}
        </span>
      )}
    </button>
  );
}
