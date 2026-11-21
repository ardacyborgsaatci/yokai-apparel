"use client";

import { Minus, Plus } from "@phosphor-icons/react";

// The limit buttons use aria-disabled, not disabled. A disabled button that has
// focus drops focus to the page body, which would leave the cart drawer.
const BUTTON =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-muted text-bone transition-colors hover:border-bone active:border-bone active:duration-0 aria-disabled:cursor-not-allowed aria-disabled:border-muted/40 aria-disabled:text-bone/40 aria-disabled:hover:border-muted/40 aria-disabled:active:border-muted/40";

// Minimum 1. Maximum is the stock of that size. Remove is a separate action.
export function QuantityStepper({
  label,
  value,
  max,
  onChange,
}: {
  // Names the line, for example "Kitsune Tee, size M".
  label: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        aria-disabled={value <= 1}
        onClick={() => value > 1 && onChange(value - 1)}
        className={BUTTON}
      >
        <Minus size={20} aria-hidden="true" />
      </button>
      <span
        role="status"
        aria-label={`Quantity of ${label}`}
        className="min-w-10 text-center text-base font-semibold"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        aria-disabled={value >= max}
        onClick={() => value < max && onChange(value + 1)}
        className={BUTTON}
      >
        <Plus size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
