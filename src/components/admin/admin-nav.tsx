"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The three links of the top bar. The current section is secondary, underlined
// and has aria-current="page". "View store" is never current.
export function AdminNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin/products", label: "Products", section: "/admin/products" },
    { href: "/admin/orders", label: "Orders", section: "/admin/orders" },
    { href: "/", label: "View store", section: null },
  ];
  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const current =
          link.section !== null &&
          (pathname === link.section || pathname.startsWith(`${link.section}/`));
        return (
          <Button
            key={link.href}
            asChild
            variant={current ? "secondary" : "ghost"}
          >
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={cn(current && "underline underline-offset-4")}
            >
              {link.label}
            </Link>
          </Button>
        );
      })}
      {children}
    </nav>
  );
}
