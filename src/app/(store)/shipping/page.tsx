import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Shipping rates, estimated tax and return rules.",
};

export default function ShippingPage() {
  return (
    <div className="wrap pt-12 md:pt-16">
      <p className="eyebrow">Help</p>
      <h1 className="display mt-2 text-5xl sm:text-7xl">Shipping &amp; Returns</h1>

      <div className="mt-12 grid max-w-3xl gap-12">
        <section aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" className="display text-3xl">
            Shipping
          </h2>
          <p className="mt-4 text-bone/90">
            We ship to addresses in California only. Free shipping on orders of
            $100 or more.
          </p>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt>Orders under $100</dt>
              <dd className="font-semibold">$6.00 flat</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt>Orders of $100 or more</dt>
              <dd className="font-semibold">Free</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="tax-heading">
          <h2 id="tax-heading" className="display text-3xl">
            Sales tax
          </h2>
          <p className="mt-4 text-bone/90">
            We show an estimated sales tax of 7.25% at checkout. This is the
            California base rate. Local district taxes are not included, so a
            real rate can be higher.
          </p>
        </section>

        <section aria-labelledby="returns-heading">
          <h2 id="returns-heading" className="display text-3xl">
            Returns
          </h2>
          <p className="mt-4 text-bone/90">
            You can return unworn, unwashed items with tags within 30 days for
            a refund to your original payment method. You pay for return
            shipping.
          </p>
        </section>

        <p className="rounded-xl border border-line p-5 text-muted">
          This is a demo store. No real orders are placed, shipped or charged,
          and no returns are processed.
        </p>
      </div>
    </div>
  );
}
