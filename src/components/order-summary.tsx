import Image from "next/image";
import { formatPrice, sizeLabel } from "@/lib/format";
import { TAX_RATE_LABEL, type Totals } from "@/lib/money";

export type SummaryItem = {
  key: string;
  name: string;
  size: string;
  quantity: number;
  lineTotalCents: number;
  image: string | null;
};

// Lines and money rows of the Order summary. No hooks, so Server and Client
// Components can both use it. The wrapper draws the panel and the heading.
export function OrderSummaryBody({
  items,
  totals,
  totalClassName = "flex",
}: {
  items: SummaryItem[];
  totals: Totals;
  // "flex" shows the Total row. Checkout hides it below `lg`: the bar shows it.
  totalClassName?: string;
}) {
  return (
    <>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.key} className="flex gap-4">
            <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg bg-raised">
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="display text-lg">{item.name}</p>
              <p className="mt-1 text-sm text-muted">
                {sizeLabel(item.size)}, qty {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold">
              {formatPrice(item.lineTotalCents)}
            </p>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2 border-t border-line pt-4 text-base">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{formatPrice(totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Shipping</dt>
          <dd>
            {totals.shippingCents === 0 ? "Free" : formatPrice(totals.shippingCents)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Estimated tax ({TAX_RATE_LABEL})</dt>
          <dd>{formatPrice(totals.taxCents)}</dd>
        </div>
        <div
          className={`${totalClassName} items-baseline justify-between gap-4 border-t border-line pt-4`}
        >
          <dt className="display text-2xl">Total</dt>
          <dd className="display text-2xl">{formatPrice(totals.totalCents)}</dd>
        </div>
      </dl>
    </>
  );
}
