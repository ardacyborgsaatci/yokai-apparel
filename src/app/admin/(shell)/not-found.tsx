import Link from "next/link";
import { Button } from "@/components/ui/button";

// An unknown order or product id (DESIGN.md 7.7, Not found). It renders inside
// the admin shell, so the top bar, the demo Alert and the one <main id="main">
// come from the shell layout. The proxy sends unknown ids to the prerendered
// sample address of the same section, so the response keeps HTTP 404.
export default function AdminNotFound() {
  return (
    <div className="max-w-2xl min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <p className="mt-2 text-muted-foreground">
        This order or product does not exist. The nightly demo reset may have
        removed it.
      </p>
      <Button asChild className="mt-6">
        <Link href="/admin">Back to admin</Link>
      </Button>
    </div>
  );
}
