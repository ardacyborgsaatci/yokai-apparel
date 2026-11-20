import { createPublicClient } from "@/lib/supabase";

// Reads go through the get_order database function (RLS has no policy on the
// order tables). Never cached: an order page must not be shared or stale.

export type OrderItem = {
  product_name: string;
  product_name_ja: string | null;
  image_path: string | null;
  size: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

export type Order = {
  id: string;
  order_number: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  items: OrderItem[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isUuid(id)) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_order", { order_id: id });
  if (error) throw new Error(`Could not load the order: ${error.message}`);
  return (data as Order | null) ?? null;
}
