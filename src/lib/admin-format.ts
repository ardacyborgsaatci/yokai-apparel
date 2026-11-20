import { ONE_SIZE } from "@/lib/catalog";

// Dates look like "Nov 20, 2026, 3:42 PM", always in Pacific time (DESIGN.md 7.7).
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatOrderDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

function units(count: number): string {
  return count === 1 ? "1 unit" : `${count} units`;
}

// Stock text for the Products list (DESIGN.md 7.2). A One Size product shows
// only the units. A clothing product adds the sold-out sizes when there are any.
export function stockText(variants: { size: string; stock: number }[]): string {
  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  const isOneSize = variants.length === 1 && variants[0].size === ONE_SIZE;
  if (isOneSize) return units(total);
  const soldOut = variants.filter((v) => v.stock === 0).length;
  if (soldOut === 0) return units(total);
  return `${units(total)}, ${soldOut} ${soldOut === 1 ? "size" : "sizes"} sold out`;
}
