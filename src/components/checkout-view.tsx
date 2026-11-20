"use client";

import { CaretDown, Check, Lock } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { placeOrder } from "@/app/checkout/actions";
import { useCart } from "@/components/cart-provider";
import { EmptyState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { InlineMessage } from "@/components/inline-message";
import { OrderSummaryBody, type SummaryItem } from "@/components/order-summary";
import { ONE_SIZE } from "@/lib/catalog";
import { clearCart, type CartLine, type StockFailure } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { computeTotals } from "@/lib/money";

const PROCESSING_MS = 1500;
const SERVER_ERROR =
  "We could not place your order. Nothing was charged. Try again.";
const DEFAULT_EMPTY_LINE = "Add an item, then come back to check out.";
const LAST_ITEM_EMPTY_LINE =
  "The last item in your cart sold out. Add another item to check out.";

// Shipping fields, in page order. The field ids follow the key.
type ShipKey = "email" | "fullName" | "line1" | "city" | "zip";
const SHIP_ORDER: ShipKey[] = ["email", "fullName", "line1", "city", "zip"];
const SHIP_ID: Record<ShipKey | "line2", string> = {
  email: "ship-email",
  fullName: "ship-name",
  line1: "ship-line1",
  line2: "ship-line2",
  city: "ship-city",
  zip: "ship-zip",
};
// Same limits as place_order in supabase/migrations/20261120020838_orders.sql.
const SHIP_MAX: Record<Exclude<ShipKey, "zip"> | "line2", number> = {
  email: 254,
  fullName: 200,
  line1: 200,
  line2: 200,
  city: 100,
};
const SHIP_ERROR: Record<ShipKey, string> = {
  email: "Enter an email address like name@example.com.",
  fullName: "Enter your full name.",
  line1: "Enter your street address.",
  city: "Enter your city.",
  zip: "Enter a 5-digit ZIP code, like 94103.",
};

type Shipping = Record<ShipKey | "line2", string>;
type ShipErrors = Partial<Record<ShipKey, string | null>>;

function checkShip(key: ShipKey, value: string): string | null {
  const text = value.trim();
  if (key === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? null : SHIP_ERROR.email;
  }
  if (key === "zip") return /^\d{5}$/.test(text) ? null : SHIP_ERROR.zip;
  return text ? null : SHIP_ERROR[key];
}

// Card fields. The browser checks the format only. Nothing here leaves the page.
type CardKey = "number" | "name" | "expiry" | "cvc";
const CARD_ORDER: CardKey[] = ["number", "name", "expiry", "cvc"];
const CARD_ID: Record<CardKey, string> = {
  number: "card-number",
  name: "card-name",
  expiry: "card-expiry",
  cvc: "card-cvc",
};
const CARD_ERROR: Record<CardKey, string> = {
  number: "Enter a card number with 13 to 19 digits.",
  name: "Enter the name on the card.",
  expiry: "Enter a date that has not passed, like 08 / 28.",
  cvc: "Enter the 3 or 4 digit code on your card.",
};

type Card = Record<CardKey, string>;
type CardErrors = Partial<Record<CardKey, string | null>>;

function checkCard(key: CardKey, value: string): string | null {
  const text = value.trim();
  if (key === "number") {
    return /^\d{13,19}$/.test(text.replace(/\s/g, "")) ? null : CARD_ERROR.number;
  }
  if (key === "name") return text ? null : CARD_ERROR.name;
  if (key === "cvc") return /^\d{3,4}$/.test(text) ? null : CARD_ERROR.cvc;
  const match = /^(\d{2})\s*\/?\s*(\d{2})$/.exec(text);
  if (!match) return CARD_ERROR.expiry;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const valid =
    month >= 1 &&
    month <= 12 &&
    (year > now.getFullYear() ||
      (year === now.getFullYear() && month >= now.getMonth() + 1));
  return valid ? null : CARD_ERROR.expiry;
}

function stockMessage(failures: StockFailure[], lines: CartLine[]): string | null {
  const parts: string[] = [];
  for (const failure of failures) {
    const line = lines.find(
      (item) => item.slug === failure.slug && item.size === failure.size,
    );
    if (!line) continue;
    const what =
      line.size === ONE_SIZE ? line.name : `${line.name} in size ${line.size}`;
    parts.push(
      failure.available <= 0
        ? `${what} is sold out. We removed it from your cart.`
        : `Only ${failure.available} ${what} is left. We changed your quantity to ${failure.available}.`,
    );
  }
  return parts.length > 0
    ? `${parts.join(" ")} Check your order, then pay again.`
    : null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function Step({
  number,
  label,
  state,
}: {
  number: number;
  label: string;
  state: "current" | "done" | "locked";
}) {
  const bar =
    state === "current"
      ? "border-vermilion"
      : state === "done"
        ? "border-bone"
        : "border-line";
  const tone = state === "locked" ? "text-muted" : "text-bone";
  return (
    <li
      aria-current={state === "current" ? "step" : undefined}
      className={`border-t-4 pt-3 text-sm font-semibold uppercase tracking-widest ${bar} ${tone}`}
    >
      <span className="flex items-center gap-2">
        {state === "done" && (
          <>
            <Check size={20} aria-hidden="true" />
            <span className="sr-only">Done</span>
          </>
        )}
        <span>
          {number} {label}
        </span>
      </span>
      {state === "locked" && (
        <span className="mt-1 flex items-center gap-2">
          <Lock size={20} aria-hidden="true" />
          Locked
        </span>
      )}
    </li>
  );
}

export function CheckoutView() {
  const { lines, ready, applyStockFailures } = useCart();
  const router = useRouter();

  const [ship, setShip] = useState<Shipping>({
    email: "",
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    zip: "",
  });
  const [shipErrors, setShipErrors] = useState<ShipErrors>({});
  const [card, setCard] = useState<Card>({
    number: "4242 4242 4242 4242",
    name: "",
    expiry: "",
    cvc: "",
  });
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [shippingDone, setShippingDone] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [lastItemSoldOut, setLastItemSoldOut] = useState(false);
  // Each request moves focus once. `n` makes a repeat of the same target work.
  const [focusRequest, setFocusRequest] = useState<{
    target: "shipping" | "payment" | "error" | "empty";
    n: number;
  } | null>(null);

  const shippingHeading = useRef<HTMLHeadingElement>(null);
  const paymentHeading = useRef<HTMLHeadingElement>(null);
  const errorBox = useRef<HTMLDivElement>(null);
  const emptyHeading = useRef<HTMLHeadingElement>(null);
  const placed = useRef(false);

  // The cart empties when the confirmation page replaces this page, not before:
  // an empty cart here would flash the Empty state while the next page loads.
  useEffect(
    () => () => {
      if (placed.current) clearCart();
    },
    [],
  );

  useEffect(() => {
    if (!focusRequest) return;
    const target = {
      shipping: shippingHeading,
      payment: paymentHeading,
      error: errorBox,
      empty: emptyHeading,
    }[focusRequest.target];
    target.current?.focus();
  }, [focusRequest]);

  const requestFocus = (target: "shipping" | "payment" | "error" | "empty") =>
    setFocusRequest((current) => ({ target, n: (current?.n ?? 0) + 1 }));

  // The "last item sold out" line belongs to that one empty cart. When items
  // are back in the cart, it no longer applies.
  if (lastItemSoldOut && lines.length > 0) setLastItemSoldOut(false);

  if (!ready) return null;

  if (lines.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          heading="Your cart is empty"
          line={lastItemSoldOut ? LAST_ITEM_EMPTY_LINE : DEFAULT_EMPTY_LINE}
          actionLabel="Browse the shop"
          actionHref="/shop"
          headingRef={emptyHeading}
        />
      </div>
    );
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.priceCents * line.quantity,
    0,
  );
  const totals = computeTotals(subtotal);
  const items: SummaryItem[] = lines.map((line) => ({
    key: `${line.slug}:${line.size}`,
    name: line.name,
    size: line.size,
    quantity: line.quantity,
    lineTotalCents: line.priceCents * line.quantity,
    image: line.image,
  }));

  function changeShip(key: ShipKey | "line2", value: string) {
    setShip((current) => ({ ...current, [key]: value }));
    if (key !== "line2" && shipErrors[key]) {
      setShipErrors((current) => ({ ...current, [key]: checkShip(key, value) }));
    }
  }

  function blurShip(key: ShipKey) {
    setShipErrors((current) => ({ ...current, [key]: checkShip(key, ship[key]) }));
  }

  function changeCard(key: CardKey, value: string) {
    setCard((current) => ({ ...current, [key]: value }));
    if (cardErrors[key]) {
      setCardErrors((current) => ({ ...current, [key]: checkCard(key, value) }));
    }
  }

  function blurCard(key: CardKey) {
    setCardErrors((current) => ({ ...current, [key]: checkCard(key, card[key]) }));
  }

  function onContinue(event: React.FormEvent) {
    event.preventDefault();
    const errors: ShipErrors = {};
    let first: ShipKey | null = null;
    for (const key of SHIP_ORDER) {
      const error = checkShip(key, ship[key]);
      errors[key] = error;
      if (error && !first) first = key;
    }
    setShipErrors(errors);
    if (first) {
      document.getElementById(SHIP_ID[first])?.focus();
      return;
    }
    setShip((current) => ({
      email: current.email.trim(),
      fullName: current.fullName.trim(),
      line1: current.line1.trim(),
      line2: current.line2.trim(),
      city: current.city.trim(),
      zip: current.zip.trim(),
    }));
    setShippingDone(true);
    requestFocus("payment");
  }

  function onEdit() {
    setShippingDone(false);
    requestFocus("shipping");
  }

  async function onPay(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const errors: CardErrors = {};
    let first: CardKey | null = null;
    for (const key of CARD_ORDER) {
      const error = checkCard(key, card[key]);
      errors[key] = error;
      if (error && !first) first = key;
    }
    setCardErrors(errors);
    if (first) {
      document.getElementById(CARD_ID[first])?.focus();
      return;
    }

    setBusy(true);
    setPayError(null);
    const started = Date.now();
    const result = await placeOrder({
      items: lines.map((line) => ({
        slug: line.slug,
        size: line.size,
        quantity: line.quantity,
      })),
      // No card value is sent. The browser keeps card data.
      shipping: {
        email: ship.email,
        full_name: ship.fullName,
        address_line1: ship.line1,
        address_line2: ship.line2,
        city: ship.city,
        zip: ship.zip,
      },
    }).catch(() => ({ status: "error" }) as const);
    await sleep(Math.max(0, PROCESSING_MS - (Date.now() - started)));

    if (result.status === "ok") {
      placed.current = true;
      // Stay in the busy state until the confirmation page replaces this page.
      startTransition(() => router.push(`/order/${result.orderId}`));
      return;
    }

    setBusy(false);
    if (result.status === "stock") {
      const message = stockMessage(result.failures, lines);
      if (message) {
        const kept = lines.filter(
          (line) =>
            !result.failures.some(
              (failure) =>
                failure.slug === line.slug &&
                failure.size === line.size &&
                failure.available <= 0,
            ),
        );
        applyStockFailures(result.failures);
        if (kept.length === 0) {
          setLastItemSoldOut(true);
          requestFocus("empty");
        } else {
          setPayError(message);
          requestFocus("error");
        }
        return;
      }
    }
    setPayError(SERVER_ERROR);
    requestFocus("error");
  }

  const sticky = lines.length <= 3;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-x-12">
      {/* Summary comes first in the DOM, so on phones it sits above the steps. */}
      <div
        className={`lg:col-start-2 lg:row-start-1 ${sticky ? "lg:sticky lg:top-24" : ""}`}
      >
        <button
          type="button"
          aria-expanded={summaryOpen}
          aria-controls="order-summary-panel"
          onClick={() => setSummaryOpen((open) => !open)}
          className="flex min-h-14 w-full items-center justify-between gap-4 border border-muted bg-surface px-4 transition-colors hover:border-bone lg:hidden"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest">
            Order summary
            <CaretDown
              size={20}
              aria-hidden="true"
              className={summaryOpen ? "rotate-180" : undefined}
            />
          </span>
          <span className="display text-2xl">{formatPrice(totals.totalCents)}</span>
        </button>
        <div
          id="order-summary-panel"
          className={`${summaryOpen ? "mt-2 block" : "hidden"} border border-line bg-surface p-4 lg:mt-0 lg:block lg:p-6`}
        >
          <h2 className="display mb-6 hidden text-3xl lg:block">Order summary</h2>
          <OrderSummaryBody
            items={items}
            totals={totals}
            totalClassName="hidden lg:flex"
          />
        </div>
      </div>

      <div className="lg:col-start-1 lg:row-start-1">
        <ol className="grid grid-cols-2 gap-4">
          <Step
            number={1}
            label="Shipping"
            state={shippingDone ? "done" : "current"}
          />
          <Step
            number={2}
            label="Payment"
            state={shippingDone ? "current" : "locked"}
          />
        </ol>

        <section
          aria-labelledby="shipping-heading"
          className="mt-8 border-t border-line pt-8"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              id="shipping-heading"
              ref={shippingHeading}
              tabIndex={-1}
              className="display text-3xl"
            >
              Shipping
            </h2>
            {shippingDone && (
              <button
                type="button"
                aria-label="Edit shipping details"
                onClick={onEdit}
                className="inline-flex min-h-11 items-center underline underline-offset-4 transition-colors hover:text-vermilion"
              >
                Edit
              </button>
            )}
          </div>
          {shippingDone ? (
            <address className="mt-3 space-y-1 not-italic text-bone/90">
              <p>{ship.fullName}</p>
              <p>{ship.line1}</p>
              {ship.line2 && <p>{ship.line2}</p>}
              <p>
                {ship.city}, CA {ship.zip}
              </p>
              <p>{ship.email}</p>
            </address>
          ) : (
            <>
              <p className="mt-3 text-bone/90">
                We ship to California only. Free shipping on orders of $100 or
                more.
              </p>
              <form noValidate onSubmit={onContinue} className="mt-6 grid gap-5">
                <FormField
                  id={SHIP_ID.email}
                  label="Email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={SHIP_MAX.email}
                  required
                  value={ship.email}
                  onChange={(value) => changeShip("email", value)}
                  onBlur={() => blurShip("email")}
                  error={shipErrors.email}
                  help="Used for this order only. No email is sent in this demo."
                />
                <FormField
                  id={SHIP_ID.fullName}
                  label="Full name"
                  autoComplete="name"
                  maxLength={SHIP_MAX.fullName}
                  required
                  value={ship.fullName}
                  onChange={(value) => changeShip("fullName", value)}
                  onBlur={() => blurShip("fullName")}
                  error={shipErrors.fullName}
                />
                <FormField
                  id={SHIP_ID.line1}
                  label="Street address"
                  autoComplete="address-line1"
                  maxLength={SHIP_MAX.line1}
                  required
                  value={ship.line1}
                  onChange={(value) => changeShip("line1", value)}
                  onBlur={() => blurShip("line1")}
                  error={shipErrors.line1}
                />
                <FormField
                  id={SHIP_ID.line2}
                  label="Apartment, suite or unit (optional)"
                  autoComplete="address-line2"
                  maxLength={SHIP_MAX.line2}
                  value={ship.line2}
                  onChange={(value) => changeShip("line2", value)}
                  onBlur={() => {}}
                />
                <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_7rem_8rem] sm:gap-4">
                  <FormField
                    id={SHIP_ID.city}
                    label="City"
                    autoComplete="address-level2"
                    maxLength={SHIP_MAX.city}
                    required
                    value={ship.city}
                    onChange={(value) => changeShip("city", value)}
                    onBlur={() => blurShip("city")}
                    error={shipErrors.city}
                  />
                  <div className="grid grid-cols-2 gap-4 sm:contents">
                    <div>
                      <p className="text-sm font-semibold">State</p>
                      <p className="flex min-h-12 items-center text-base">
                        California
                      </p>
                    </div>
                    <FormField
                      id={SHIP_ID.zip}
                      label="ZIP code"
                      inputMode="numeric"
                      maxLength={5}
                      autoComplete="postal-code"
                      required
                      value={ship.zip}
                      onChange={(value) => changeShip("zip", value)}
                      onBlur={() => blurShip("zip")}
                      error={shipErrors.zip}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="display inline-flex min-h-12 w-full items-center justify-center bg-vermilion px-8 text-lg text-ink transition-colors hover:bg-bone sm:w-auto sm:justify-self-start"
                >
                  Continue to payment
                </button>
              </form>
            </>
          )}
        </section>

        <section
          aria-labelledby="payment-heading"
          className="mt-8 border-t border-line pt-8"
        >
          <h2
            id="payment-heading"
            ref={paymentHeading}
            tabIndex={-1}
            className={`display text-3xl ${shippingDone ? "" : "text-muted"}`}
          >
            Payment
          </h2>
          {shippingDone ? (
            <>
              <InlineMessage kind="info" className="mt-4">
                Demo store: no real payment is taken
              </InlineMessage>
              <form noValidate onSubmit={onPay} className="mt-6 grid gap-5">
                <FormField
                  id={CARD_ID.number}
                  label="Card number"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  value={card.number}
                  onChange={(value) => changeCard("number", value)}
                  onBlur={() => blurCard("number")}
                  error={cardErrors.number}
                  help="Demo test card. Any future expiry date and any 3-digit CVC work."
                />
                <FormField
                  id={CARD_ID.name}
                  label="Name on card"
                  autoComplete="off"
                  required
                  value={card.name}
                  onChange={(value) => changeCard("name", value)}
                  onBlur={() => blurCard("name")}
                  error={cardErrors.name}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    id={CARD_ID.expiry}
                    label="Expiry date"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    value={card.expiry}
                    onChange={(value) => changeCard("expiry", value)}
                    onBlur={() => blurCard("expiry")}
                    error={cardErrors.expiry}
                    help="Month and year, like 08 / 28."
                  />
                  <FormField
                    id={CARD_ID.cvc}
                    label="CVC"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    value={card.cvc}
                    onChange={(value) => changeCard("cvc", value)}
                    onBlur={() => blurCard("cvc")}
                    error={cardErrors.cvc}
                  />
                </div>
                {payError && (
                  <InlineMessage
                    kind="error"
                    role="alert"
                    tabIndex={-1}
                    ref={errorBox}
                  >
                    {payError}
                  </InlineMessage>
                )}
                <button
                  type="submit"
                  aria-disabled={busy}
                  className="display flex min-h-14 w-full items-center justify-center bg-vermilion px-8 text-xl text-ink transition-colors hover:bg-bone aria-disabled:opacity-70 aria-disabled:hover:bg-vermilion"
                >
                  {busy ? "Processing..." : `Pay ${formatPrice(totals.totalCents)}`}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted">
                <Lock size={20} aria-hidden="true" />
                Locked
              </p>
              <p className="mt-2 text-muted">Finish shipping to unlock payment.</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
