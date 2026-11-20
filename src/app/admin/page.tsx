import { redirect } from "next/navigation";

// /admin opens Products (DESIGN.md 7).
export default function AdminIndexPage() {
  redirect("/admin/products");
}
