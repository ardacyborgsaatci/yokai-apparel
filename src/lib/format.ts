// Prices always show cents: $38.00.
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

// "Size M", or "One Size" for a product with one size.
export function sizeLabel(size: string): string {
  return size === "One Size" ? "One Size" : `Size ${size}`;
}
