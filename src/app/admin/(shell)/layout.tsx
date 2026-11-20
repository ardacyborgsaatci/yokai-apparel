import { Info } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { ADMIN_WRAP } from "@/components/admin/wrap";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// The shell for every admin page except Login (DESIGN.md 7.1): top bar, demo
// Alert and one <main id="main">. No store header or footer.
export default function AdminShellLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b">
        <div className={`${ADMIN_WRAP} py-3`}>
          <AdminNav>
            <form action={signOut} className="ml-auto">
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </AdminNav>
        </div>
      </header>
      <div className={`${ADMIN_WRAP} mt-4`}>
        <Alert>
          <Info aria-hidden="true" />
          <AlertDescription>
            Demo admin. Anyone can change this data. Everything resets every
            night.
          </AlertDescription>
        </Alert>
      </div>
      <main id="main" className="py-8">
        <div className={ADMIN_WRAP}>{children}</div>
      </main>
    </>
  );
}
