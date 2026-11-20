// Cart state for the browser. It lives in memory and is saved to localStorage.
// A line holds display data only. The cart never decides money: the server
// reads prices from the database when an order is placed.

export type CartLine = {
  slug: string;
  size: string;
  quantity: number;
  name: string;
  priceCents: number;
  image: string | null;
  // Stock of this size when the line was added or last checked.
  max: number;
};

export type StockFailure = {
  slug: string;
  size: string;
  requested: number;
  available: number;
};

const STORAGE_KEY = "yokai-cart-v1";
export const MAX_LINE_QUANTITY = 99;
const NO_LINES: CartLine[] = [];

let lines: CartLine[] = NO_LINES;
let loaded = false;
let listening = false;
const listeners = new Set<() => void>();

function isLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.slug === "string" &&
    typeof v.size === "string" &&
    typeof v.name === "string" &&
    (typeof v.image === "string" || v.image === null) &&
    Number.isInteger(v.quantity) &&
    (v.quantity as number) >= 1 &&
    Number.isInteger(v.priceCents) &&
    (v.priceCents as number) >= 0 &&
    Number.isInteger(v.max) &&
    (v.max as number) >= 1
  );
}

function parse(raw: string | null): CartLine[] {
  if (!raw) return NO_LINES;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return NO_LINES;
    const valid = data.filter(isLine).map((line) => ({
      ...line,
      quantity: Math.min(line.quantity, line.max, MAX_LINE_QUANTITY),
    }));
    return valid.length > 0 ? valid : NO_LINES;
  } catch {
    return NO_LINES;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    lines = parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    lines = NO_LINES;
  }
}

function commit(next: CartLine[]) {
  load();
  lines = next.length > 0 ? next : NO_LINES;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage is blocked or full. The cart still works for this visit.
  }
  notify();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  try {
    lines = parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return;
  }
  notify();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!listening) {
    listening = true;
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && listening) {
      listening = false;
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getSnapshot(): CartLine[] {
  load();
  return lines;
}

export function getServerSnapshot(): CartLine[] {
  return NO_LINES;
}

const same = (line: CartLine, slug: string, size: string) =>
  line.slug === slug && line.size === size;

// One more of this size. An existing line goes up by one, capped at its stock.
export function addLine(item: Omit<CartLine, "quantity">) {
  load();
  const cap = Math.max(1, Math.min(item.max, MAX_LINE_QUANTITY));
  const existing = lines.find((line) => same(line, item.slug, item.size));
  if (!existing) {
    commit([...lines, { ...item, max: cap, quantity: 1 }]);
    return;
  }
  commit(
    lines.map((line) =>
      same(line, item.slug, item.size)
        ? {
            ...line,
            ...item,
            max: cap,
            quantity: Math.min(line.quantity + 1, cap),
          }
        : line,
    ),
  );
}

export function setLineQuantity(slug: string, size: string, quantity: number) {
  load();
  commit(
    lines.map((line) =>
      same(line, slug, size)
        ? {
            ...line,
            quantity: Math.max(1, Math.min(quantity, line.max)),
          }
        : line,
    ),
  );
}

export function removeLine(slug: string, size: string) {
  load();
  commit(lines.filter((line) => !same(line, slug, size)));
}

export function clearCart() {
  commit([]);
}

// The server said a size has less stock than the cart asks for.
// No stock left: remove the line. Less stock: lower the quantity to what is left.
export function applyStockFailures(failures: StockFailure[]) {
  load();
  commit(
    lines.flatMap((line) => {
      const failure = failures.find((f) => same(line, f.slug, f.size));
      if (!failure) return [line];
      if (failure.available <= 0) return [];
      return [
        {
          ...line,
          max: failure.available,
          quantity: Math.min(line.quantity, failure.available),
        },
      ];
    }),
  );
}

export function subtotalOf(items: CartLine[]): number {
  return items.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

export function countOf(items: CartLine[]): number {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}
