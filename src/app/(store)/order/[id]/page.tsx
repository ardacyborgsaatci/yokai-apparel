import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FocusHeading } from "@/components/focus-heading";
import { InlineMessage } from "@/components/inline-message";
import { OrderSummaryBody, type SummaryItem } from "@/components/order-summary";
import { getOrder, isUuid } from "@/lib/orders";

// The title must not say "Order placed" on a 404, so it depends on the id.
export async function generateMetadata({
  params,
}: PageProps<"/order/[id]">): Promise<Metadata> {
  const { id } = await params;
  return isUuid(id)
    ? { title: "Order placed", robots: { index: false } }
    : { title: "Page not found" };
}

// Same approach as the product page: params are awaited outside any Suspense
// boundary, so an unknown id returns a real HTTP 404 before anything streams.
// The one sample id is not a uuid: the page calls notFound() for it at build
// time, before any database call. Every real id renders on request, never cached.
export const instant = false;

export function generateStaticParams() {
  return [{ id: "sample" }];
}

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const order = await getOrder(id);
  if (!order) notFound();

  const items: SummaryItem[] = order.items.map((item, index) => ({
    key: `${index}`,
    name: item.product_name,
    size: item.size,
    quantity: item.quantity,
    lineTotalCents: item.line_total_cents,
    image: item.image_path,
  }));
  const totals = {
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    taxCents: order.tax_cents,
    totalCents: order.total_cents,
  };

  return (
    <div className="wrap pb-8 pt-12 md:pt-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-[repeat(5,auto)_1fr] lg:gap-x-12">
        <FocusHeading className="display text-5xl sm:text-7xl lg:col-span-2">
          Order placed
        </FocusHeading>

        <InlineMessage kind="success" className="lg:col-start-1 lg:row-start-2">
          <p>
            Your order number is{" "}
            <span className="font-semibold">{order.order_number}</span>.
          </p>
        </InlineMessage>

        <section
          aria-labelledby="next-heading"
          className="lg:col-start-1 lg:row-start-3"
        >
          <h2 id="next-heading" className="display text-3xl">
            What happens next
          </h2>
          <div className="mt-4 max-w-prose space-y-6 text-bone/90">
            <p>This is a demo store. No payment was taken, and nothing will ship.</p>
            <p>No confirmation email is sent.</p>
          </div>
        </section>

        <section
          aria-labelledby="summary-heading"
          className="rounded-xl border border-line bg-surface p-4 lg:col-start-2 lg:row-span-5 lg:row-start-2 lg:self-start lg:p-6"
        >
          <h2 id="summary-heading" className="display mb-6 text-3xl">
            Order summary
          </h2>
          <OrderSummaryBody items={items} totals={totals} />
        </section>

        <section
          aria-labelledby="address-heading"
          className="lg:col-start-1 lg:row-start-4"
        >
          <h2 id="address-heading" className="display text-3xl">
            Shipping address
          </h2>
          <address className="mt-4 space-y-1 not-italic text-bone/90">
            <p>{order.full_name}</p>
            <p>{order.address_line1}</p>
            {order.address_line2 && <p>{order.address_line2}</p>}
            <p>
              {order.city}, {order.state} {order.zip}
            </p>
          </address>
        </section>

        <div className="lg:col-start-1 lg:row-start-5">
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center underline underline-offset-4 transition-colors hover:decoration-2 active:decoration-2 active:duration-0"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
