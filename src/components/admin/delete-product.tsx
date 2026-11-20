"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/app/admin/(shell)/products/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FAILURE_TEXT } from "@/lib/admin-validation";

// Edit page only (DESIGN.md 7.4). A rule and space keep it away from Save.
export function DeleteProduct({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onDelete(event: React.MouseEvent) {
    // Keep the dialog open until the delete is done.
    event.preventDefault();
    // The busy button ignores presses.
    if (busy) return;
    setBusy(true);
    try {
      const result = await deleteProduct(id);
      if (result.ok) {
        toast.success("Product deleted");
        router.push("/admin/products");
        return;
      }
      toast.error(FAILURE_TEXT);
    } catch {
      toast.error(FAILURE_TEXT);
    }
    setBusy(false);
  }

  return (
    <div className="mt-8 border-t pt-8">
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!busy) setOpen(next);
        }}
      >
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive">
            Delete product
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It leaves the store now. Past orders keep their own copy of the
              name, size and price.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              aria-disabled={busy ? "true" : undefined}
              onClick={onDelete}
            >
              {busy ? "Deleting..." : "Delete product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
