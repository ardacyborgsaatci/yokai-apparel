import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// The store frame: header, the one <main id="main">, footer and cart drawer.
// The store layout and the not-found page both use it. The admin has its own
// layout and does not show any of this.
export function StoreChrome({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
}
