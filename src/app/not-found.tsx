import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";
import { StoreChrome } from "@/components/store-chrome";

export const metadata: Metadata = {
  title: "Page not found",
};

// Addresses that match no page. The root layout has no store frame, so this
// page adds it. A notFound() call inside the store uses (store)/not-found.tsx.
export default function NotFound() {
  return (
    <StoreChrome>
      <NotFoundContent />
    </StoreChrome>
  );
}
