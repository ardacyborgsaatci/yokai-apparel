// Money rules, in cents. The server (place_order) computes the real amounts.
// The browser uses the same rule to show the numbers before Pay.
export const SHIPPING_CENTS = 600;
export const FREE_SHIPPING_CENTS = 10000;
export const TAX_RATE_LABEL = "7.25%";

export type Totals = {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

export function computeTotals(subtotalCents: number): Totals {
  const shippingCents =
    subtotalCents >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS;
  // 7.25% of the subtotal only, rounded half up to whole cents.
  const taxCents = Math.floor((subtotalCents * 725 + 5000) / 10000);
  return {
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + shippingCents + taxCents,
  };
}
