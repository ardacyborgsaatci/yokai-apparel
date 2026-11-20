"use server";

import { updateTag } from "next/cache";
import type { StockFailure } from "@/lib/cart-store";
import { createPublicClient } from "@/lib/supabase";

export type PlaceOrderInput = {
  items: { slug: string; size: string; quantity: number }[];
  shipping: {
    email: string;
    full_name: string;
    address_line1: string;
    address_line2: string;
    city: string;
    zip: string;
  };
};

export type PlaceOrderResult =
  | { status: "ok"; orderId: string }
  | { status: "stock"; failures: StockFailure[] }
  | { status: "error" };

// Saves the order through the place_order database function. The browser sends
// slug, size and quantity only: the database reads the prices. Card values
// never reach this action.
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("place_order", {
      items: input.items,
      shipping: input.shipping,
    });
    if (error || typeof data !== "object" || data === null) {
      return { status: "error" };
    }
    const result = data as {
      status?: string;
      order_id?: string;
      failures?: StockFailure[];
    };
    if (result.status === "ok" && typeof result.order_id === "string") {
      // Stock changed: the next catalog read must see it.
      updateTag("catalog");
      return { status: "ok", orderId: result.order_id };
    }
    if (result.status === "stock" && Array.isArray(result.failures)) {
      return { status: "stock", failures: result.failures };
    }
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
