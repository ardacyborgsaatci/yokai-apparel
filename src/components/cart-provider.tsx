"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import {
  addLine,
  applyStockFailures,
  clearCart,
  countOf,
  getServerSnapshot,
  getSnapshot,
  removeLine,
  setLineQuantity,
  subtotalOf,
  subscribe,
  type CartLine,
} from "@/lib/cart-store";

type CartContextValue = {
  lines: CartLine[];
  // False until the browser has read the saved cart.
  ready: boolean;
  count: number;
  subtotalCents: number;
  add: typeof addLine;
  setQuantity: typeof setLineQuantity;
  remove: typeof removeLine;
  clear: typeof clearCart;
  applyStockFailures: typeof applyStockFailures;
  drawerOpen: boolean;
  // Opens the drawer. `opener` gets focus back when the drawer closes.
  openDrawer: (opener?: HTMLElement | null) => void;
  setDrawerOpen: (open: boolean) => void;
  openerRef: RefObject<HTMLElement | null>;
};

const CartContext = createContext<CartContextValue | null>(null);

const noopSubscribe = () => () => {};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const openDrawer = useCallback((opener?: HTMLElement | null) => {
    openerRef.current =
      opener ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setDrawerOpen(true);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: countOf(lines),
      subtotalCents: subtotalOf(lines),
      add: addLine,
      setQuantity: setLineQuantity,
      remove: removeLine,
      clear: clearCart,
      applyStockFailures,
      drawerOpen,
      openDrawer,
      setDrawerOpen,
      openerRef,
    }),
    [lines, ready, drawerOpen, openDrawer],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
