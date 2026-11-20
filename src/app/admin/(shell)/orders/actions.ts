"use server";

import { requireAdmin } from "@/lib/supabase-server";
import { isOrderStatus } from "@/lib/admin-validation";

// The status is a label only. It never changes stock, and a cancelled order
// does not give stock back (DESIGN.md 7.6). RLS lets the admin update this one
// column only (migration `admin`).
export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin();
  if (typeof id !== "string" || !isOrderStatus(status)) return { ok: false };
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("id");
    if (error || !data || data.length === 0) return { ok: false };
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
