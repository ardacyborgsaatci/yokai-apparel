import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/credits", label: "Image credits" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="wrap flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="display text-2xl">Yokai Apparel</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Streetwear for the night, inspired by the spirits of Japanese
            folklore.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-col gap-1 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-bone transition-colors hover:text-vermilion active:text-vermilion active:duration-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="wrap py-5 text-sm text-muted">
          Demo store. No real orders or payments.
        </p>
      </div>
    </footer>
  );
}
