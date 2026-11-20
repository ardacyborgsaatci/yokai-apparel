import Image from "next/image";
import Link from "next/link";
import { CartButton } from "@/components/cart-button";
import { SiteNav, type NavItem } from "@/components/site-nav";

const NAV_ITEMS: NavItem[] = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/tees", label: "Tees" },
  { href: "/shop/hoodies", label: "Hoodies" },
  { href: "/shop/accessories", label: "Accessories" },
  { href: "/about", label: "About" },
];

// Desktop: logo left, links center, cart right.
// Mobile: Menu, logo, cart. DOM order is the same as the visual order on both.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="wrap relative flex h-16 items-center justify-between gap-3 md:gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <SiteNav
          items={NAV_ITEMS}
          logo={
            <Link
              href="/"
              aria-label="Yokai Apparel, home"
              className="inline-flex min-h-11 items-center gap-2 sm:gap-3 lg:justify-self-start"
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
              <span
                aria-hidden="true"
                className="display text-lg max-[360px]:hidden sm:text-xl"
              >
                Yokai Apparel
              </span>
            </Link>
          }
          cart={<CartButton className="lg:justify-self-end" />}
        />
      </div>
    </header>
  );
}
