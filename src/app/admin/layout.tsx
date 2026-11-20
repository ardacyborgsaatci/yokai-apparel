import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./admin.css";

// Every admin page reads the session cookie, so it renders on request and
// blocks on the server. Admin data is never cached.
export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// The Toaster lives here, above the shell, so a toast survives a page change
// (DESIGN.md 7.1). The .admin class carries the admin tokens (admin.css).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin min-h-screen bg-background text-foreground">
      {children}
      <Toaster />
    </div>
  );
}
