import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/status-badge";
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
import { requireAdmin } from "@/lib/supabase-server";

export const metadata: Metadata = { title: "Orders" };

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  full_name: string;
  email: string;
  total_cents: number;
  status: string;
  order_items: { quantity: number }[];
};

export default async function OrdersPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, full_name, email, total_cents, status, order_items(quantity)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load orders: ${error.message}`);
  const orders = (data ?? []) as OrderRow[];

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 rounded-lg border p-8 text-muted-foreground">
          No orders yet. Orders from the store show up here.
        </p>
      ) : (
        <div className="mt-6 min-w-0 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium underline underline-offset-4"
                    >
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>{formatOrderDate(order.created_at)}</TableCell>
                  <TableCell>
                    <div>{order.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.total_cents)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
