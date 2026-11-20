"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";
import { EmptyState } from "@/components/empty-state";
import { QuantityStepper } from "@/components/quantity-stepper";
import type { CartLine } from "@/lib/cart-store";
import { formatPrice, sizeLabel } from "@/lib/format";
import { FREE_SHIPPING_CENTS } from "@/lib/money";

function LineItem({ line }: { line: CartLine }) {
  const { setQuantity, remove } = useCart();
  const label =
    line.size === "One Size" ? line.name : `${line.name}, size ${line.size}`;
  return (
    <li className="flex gap-4 py-5">
      <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-raised">
        {line.image ? (
          <Image
            src={line.image}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <p className="display text-lg">{line.name}</p>
          <p className="text-sm font-semibold">
            {formatPrice(line.priceCents * line.quantity)}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted">{sizeLabel(line.size)}</p>
        <p className="text-sm text-muted">{formatPrice(line.priceCents)} each</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4">
          <QuantityStepper
            label={label}
            value={line.quantity}
            max={line.max}
            onChange={(next) => setQuantity(line.slug, line.size, next)}
          />
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={() => remove(line.slug, line.size)}
            className="inline-flex min-h-11 items-center text-sm underline underline-offset-4 transition-colors hover:text-vermilion active:text-vermilion active:duration-0"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const { lines, subtotalCents, drawerOpen, setDrawerOpen, openerRef } =
    useCart();
  // Set when a link inside the drawer closes it. Focus then stays with the new page.
  const skipFocusReturn = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null);
  const lineCount = useRef(lines.length);

  // Remove deletes the button that has focus. Without this, focus falls back to
  // the dialog box. Move it to the empty heading, or to the title.
  useEffect(() => {
    if (drawerOpen && lines.length < lineCount.current) {
      (lines.length === 0 ? emptyHeadingRef : titleRef).current?.focus();
    }
    lineCount.current = lines.length;
  }, [lines.length, drawerOpen]);

  const leave = () => {
    skipFocusReturn.current = true;
    setDrawerOpen(false);
  };

  const remaining = FREE_SHIPPING_CENTS - subtotalCents;

  return (
    <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (skipFocusReturn.current) {
              skipFocusReturn.current = false;
              return;
            }
            const opener = openerRef.current;
            const target =
              opener && opener.isConnected
                ? opener
                : document.getElementById("cart-button");
            target?.focus();
          }}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-line bg-surface data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in sm:max-w-md"
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <Dialog.Title ref={titleRef} tabIndex={-1} className="display text-3xl">
              Cart
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close cart"
              className="inline-flex h-11 w-11 items-center justify-center border border-muted text-bone transition-colors hover:border-bone active:border-bone active:duration-0"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          {lines.length === 0 ? (
            <div className="flex-1 overflow-y-auto p-6">
              <EmptyState
                heading="Your cart is empty"
                line="Add an item to see it here."
                actionLabel="Browse the shop"
                actionHref="/shop"
                onAction={leave}
                headingRef={emptyHeadingRef}
              />
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                {lines.map((line) => (
                  <LineItem key={`${line.slug}:${line.size}`} line={line} />
                ))}
              </ul>
              <div className="border-t border-line px-6 py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-base font-semibold">Subtotal</p>
                  <p className="text-base font-semibold">
                    {formatPrice(subtotalCents)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {remaining > 0
                    ? `${formatPrice(remaining)} away from free shipping`
                    : "Free shipping"}
                </p>
                <Link
                  href="/checkout"
                  onClick={leave}
                  className="display mt-5 flex min-h-14 w-full items-center justify-center bg-vermilion px-8 text-xl text-ink transition-colors hover:bg-bone active:bg-bone active:duration-0"
                >
                  Checkout
                </Link>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
