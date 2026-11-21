import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderStatusCard } from "@/components/admin/order-status";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatOrderDate } from "@/lib/admin-format";
import { formatPrice } from "@/lib/format";
import { isUuid } from "@/lib/orders";
import { TAX_RATE_LABEL } from "@/lib/money";
import { requireAdmin } from "@/lib/supabase-server";

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
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
  status: string;
  created_at: string;
  order_items: {
    id: number;
    product_name: string;
    size: string;
    unit_price_cents: number;
    quantity: number;
    line_total_cents: number;
  }[];
};

// One read for the page and for the title.
const getOrder = cache(async (id: string): Promise<OrderRow | null> => {
  if (!isUuid(id)) return null;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, email, full_name, address_line1, address_line2, city, state, zip, subtotal_cents, shipping_cents, tax_cents, total_cents, status, created_at, order_items(id, product_name, size, unit_price_cents, quantity, line_total_cents)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load the order: ${error.message}`);
  return data as OrderRow | null;
});

// One sample id, so the proxy can rewrite an unknown id to a prerendered 404
// (see src/proxy.ts). "sample" is not a uuid: the page calls notFound() for it
// at build time, before any session or database call. Real ids render on request.
export function generateStaticParams() {
  return [{ id: "sample" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/admin/orders/[id]">): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrder(id);
  return { title: order ? `Order ${order.order_number}` : "Order not found" };
}

export default async function OrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const lines = [...order.order_items].sort((a, b) => a.id - b.id);

  return (
    <div className="max-w-2xl min-w-0">
      <Button asChild variant="link" className="-ml-3">
        <Link href="/admin/orders">
          <ArrowLeft aria-hidden="true" />
          All orders
        </Link>
      </Button>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Order {order.order_number}
      </h1>
      <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>{formatOrderDate(order.created_at)}</span>
        <OrderStatusBadge status={order.status} />
      </p>

      <div className="mt-6 grid gap-6">
        <OrderStatusCard id={order.id} status={order.status} />

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div
              tabIndex={0}
              role="region"
              aria-label="Order items"
              className="min-w-0 overflow-x-auto"
            >
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Item</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.product_name}</TableCell>
                      <TableCell>{line.size}</TableCell>
                      <TableCell className="text-right">{line.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(line.unit_price_cents)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(line.line_total_cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <dl className="grid gap-2 border-t pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal_cents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Shipping</dt>
                <dd>
                  {order.shipping_cents === 0
                    ? "Free"
                    : formatPrice(order.shipping_cents)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Estimated tax ({TAX_RATE_LABEL})</dt>
                <dd>{formatPrice(order.tax_cents)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total_cents)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Shipping address</dt>
                <dd>
                  <address className="not-italic">
                    {order.full_name}
                    <br />
                    {order.address_line1}
                    <br />
                    {order.address_line2 ? (
                      <>
                        {order.address_line2}
                        <br />
                      </>
                    ) : null}
                    {order.city}, {order.state} {order.zip}
                  </address>
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{order.email}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Payment</dt>
                <dd>Paid (demo)</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
