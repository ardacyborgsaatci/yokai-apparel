"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/admin/(shell)/orders/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FAILURE_TEXT,
  ORDER_STATUSES,
  STATUS_LABELS,
  isOrderStatus,
} from "@/lib/admin-validation";

// The Status card of Order detail (DESIGN.md 7.6, region 3).
export function OrderStatusCard({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(isOrderStatus(status) ? status : "pending");
  const [busy, setBusy] = useState(false);

  async function onUpdate() {
    // The busy button ignores presses.
    if (busy) return;
    setBusy(true);
    try {
      const result = await updateOrderStatus(id, value);
      if (result.ok) {
        toast.success("Status updated");
        // The Badge in the header is server rendered: refresh to change it.
        router.refresh();
      } else {
        toast.error(FAILURE_TEXT);
      }
    } catch {
      toast.error(FAILURE_TEXT);
    }
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle id="status-title">Status</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Select
          value={value}
          onValueChange={(next) => {
            if (isOrderStatus(next)) setValue(next);
          }}
        >
          <SelectTrigger aria-labelledby="status-title">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div>
          <Button
            type="button"
            aria-disabled={busy ? "true" : undefined}
            onClick={onUpdate}
          >
            {busy ? "Saving..." : "Update status"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
