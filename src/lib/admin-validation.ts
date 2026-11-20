// Admin rules that run in the browser and again on the server (DESIGN.md 7.1, 7.3).
// Pure functions only: no data access, no React.
import { CLOTHING_SIZES, ONE_SIZE } from "@/lib/catalog";

// Login -----------------------------------------------------------------------

export const EMAIL_ERROR = "Enter an email address like name@example.com.";
export const PASSWORD_ERROR = "Enter your password.";

// Text, @, text, ., text (DESIGN.md 6.2, row 1).
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// A "next" address counts only when it stays in the admin. Login itself is
// left out so a sign-in never loops back to the form.
export function safeNext(value: unknown): string {
  if (
    typeof value === "string" &&
    value.startsWith("/admin/") &&
    !value.startsWith("/admin/login") &&
    !value.startsWith("//")
  ) {
    return value;
  }
  return "/admin/products";
}

// Product form ------------------------------------------------------------------

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const FILE_ERROR = "Use a JPG, PNG or WebP file of 2 MB or less.";
export const FAILURE_TEXT = "Could not save. Try again.";

export type SizeType = "clothing" | "one";

export const SIZES_BY_TYPE: Record<SizeType, readonly string[]> = {
  clothing: CLOTHING_SIZES,
  one: [ONE_SIZE],
};

export type SlotValues = {
  // A saved image path, or the public address of a file uploaded for this save.
  path: string;
  alt: string;
  creditName: string;
  creditUrl: string;
};

export type ProductInput = {
  name: string;
  nameJa: string;
  categoryId: string;
  price: string;
  description: string;
  isActive: boolean;
  sizeType: SizeType;
  // Stock text for the rows of the chosen type only.
  stock: Record<string, string>;
  // Slot 0 is Front (sort 0). Slot 1 is Back or detail (sort 1). null = empty.
  images: [SlotValues | null, SlotValues | null];
};

// Error keys: name, category, price, description, active, stock:<size>,
// alt:<slot>, creditUrl:<slot>.
export type FieldErrors = Record<string, string>;

export const ERRORS = {
  name: "Enter a name with at least one letter or number.",
  nameTaken: "Another product already uses this name. Use a different name.",
  category: "Choose a category.",
  price: "Enter a price like 38.00.",
  description: "Enter a description.",
  active: "Add a front image before you show this product.",
  stock: "Enter a whole number, 0 or more.",
  alt: "Enter alt text for this image.",
  creditUrl: "Enter a link that starts with https:// or http://.",
} as const;

// Lower case. Each run of characters outside a-z and 0-9 becomes one hyphen.
// No hyphen at the start or end.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Dollars to whole cents. Digits with an optional "." and at most 2 decimals,
// greater than 0. Returns null when the text breaks the rule.
export function parsePriceCents(text: string): number | null {
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(text.trim());
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents > 0 ? cents : null;
}

export function isWholeNumber(text: string): boolean {
  return /^\d{1,9}$/.test(text.trim());
}

export function isHttpUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim());
}

export function validateProduct(input: ProductInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!slugify(input.name.trim())) errors.name = ERRORS.name;
  if (!/^\d+$/.test(input.categoryId)) errors.category = ERRORS.category;
  if (parsePriceCents(input.price) === null) errors.price = ERRORS.price;
  if (!input.description.trim()) errors.description = ERRORS.description;
  if (input.isActive && !input.images[0]) errors.active = ERRORS.active;
  for (const size of SIZES_BY_TYPE[input.sizeType]) {
    if (!isWholeNumber(input.stock[size] ?? "")) {
      errors[`stock:${size}`] = ERRORS.stock;
    }
  }
  input.images.forEach((slot, index) => {
    if (!slot) return;
    if (!slot.alt.trim()) errors[`alt:${index}`] = ERRORS.alt;
    if (slot.creditUrl.trim() && !isHttpUrl(slot.creditUrl)) {
      errors[`creditUrl:${index}`] = ERRORS.creditUrl;
    }
  });
  return errors;
}

// Orders ------------------------------------------------------------------------

export const ORDER_STATUSES = ["pending", "shipped", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (ORDER_STATUSES as readonly unknown[]).includes(value);
}
