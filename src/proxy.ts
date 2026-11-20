import { NextResponse, type NextRequest } from "next/server";
import { getOrder, isUuid } from "@/lib/orders";

// With Cache Components the order page streams after its shell, so a missing
// order found inside the page would still answer 200. This check runs before
// any streaming. An id that is not a real order is rewritten to /order/sample,
// which is a prerendered 404 page (see the order page). The page keeps its own
// notFound() calls for the rare case where the order disappears in between.
export async function proxy(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/")[2] ?? "";
  // An id that is not a uuid reaches the page, which answers 404 at build time.
  if (!isUuid(id)) return NextResponse.next();
  try {
    if (!(await getOrder(id))) {
      return NextResponse.rewrite(new URL("/order/sample", request.url));
    }
  } catch {
    // Database not reachable: let the page decide.
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/order/:id",
};
