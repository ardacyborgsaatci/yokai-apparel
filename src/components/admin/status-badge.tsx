import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, isOrderStatus } from "@/lib/admin-validation";

// Order status map (DESIGN.md 2.8): pending secondary, shipped default,
// cancelled destructive. The text carries the meaning.
export function OrderStatusBadge({ status }: { status: string }) {
  if (!isOrderStatus(status)) return <Badge variant="outline">{status}</Badge>;
  const variant =
    status === "pending"
      ? "secondary"
      : status === "shipped"
        ? "default"
        : "destructive";
  return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>;
}
