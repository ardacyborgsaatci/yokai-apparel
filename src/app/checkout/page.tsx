import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
};

// The cart lives in the browser, so the page body renders on the client.
// Nothing shows under the title until the browser has read the saved cart.
export default function CheckoutPage() {
  return (
    <div className="wrap pb-8 pt-12 md:pt-16">
      <h1 className="display text-5xl sm:text-7xl">Checkout</h1>
      <CheckoutView />
    </div>
  );
}
