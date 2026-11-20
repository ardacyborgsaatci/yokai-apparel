import Image from "next/image";
import Link from "next/link";
import { SiteNav, type NavItem } from "@/components/site-nav";

const NAV_ITEMS: NavItem[] = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/tees", label: "Tees" },
  { href: "/shop/hoodies", label: "Hoodies" },
  { href: "/shop/accessories", label: "Accessories" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="wrap relative flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Yokai Apparel, home"
          className="inline-flex min-h-11 items-center gap-3"
        >
          <Image
            src="/logo-mark.svg"
            alt=""
            width={32}
            height={32}
            unoptimized
            priority
            aria-hidden="true"
            className="h-8 w-8"
          />
          <span aria-hidden="true" className="display text-xl">
            Yokai Apparel
          </span>
        </Link>
        <SiteNav items={NAV_ITEMS} />
      </div>
    </header>
  );
}
