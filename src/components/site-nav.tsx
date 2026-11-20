"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return href === "/shop"
    ? pathname === "/shop"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Close the menu and put focus back on the Menu button.
  const closeMenu = () => {
    setOpen(false);
    menuButton.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = (href: string) =>
    `transition-colors hover:text-vermilion ${
      isActive(pathname, href) ? "text-vermilion" : "text-bone"
    }`;

  return (
    <>
      <nav aria-label="Main" className="hidden md:block">
        <ul className="flex items-center gap-8 text-sm font-semibold uppercase tracking-widest">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={`inline-flex min-h-11 items-center ${linkClass(item.href)}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="md:hidden">
        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 border border-muted px-4 text-sm font-semibold uppercase tracking-widest hover:border-bone"
        >
          {open ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <List size={20} aria-hidden="true" />
          )}
          {open ? "Close" : "Menu"}
        </button>
        {/* Always in the DOM so aria-controls has a target. `hidden` removes it
            from view, the tab order and the accessibility tree while closed. */}
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          hidden={!open}
          className="animate-rise absolute inset-x-0 top-full border-b border-line bg-ink"
        >
          <ul className="wrap flex flex-col py-4">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`display flex min-h-12 items-center text-3xl ${linkClass(item.href)}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
