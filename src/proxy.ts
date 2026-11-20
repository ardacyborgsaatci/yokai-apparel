import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getOrder, isUuid } from "@/lib/orders";

// Two jobs. /order/:id checks the order before the page streams. /admin/*
// needs an admin session, and refreshes the session cookie.
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminGate(request);
  }
  return orderCheck(request);
}

// With Cache Components the order page streams after its shell, so a missing
// order found inside the page would still answer 200. This check runs before
// any streaming. An id that is not a real order is rewritten to /order/sample,
// which is a prerendered 404 page (see the order page). The page keeps its own
// notFound() calls for the rare case where the order disappears in between.
async function orderCheck(request: NextRequest) {
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

// Every admin address except Login needs a valid admin session. Without one the
// visitor goes to Login, with the asked path in `next` (DESIGN.md 7.1). The
// pages and Server Actions check the session again: this is not the only guard.
async function adminGate(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers ?? {})) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // getClaims() checks the token signature, and refreshes it when it is old.
  const { data } = await supabase.auth.getClaims();
  const isAdmin = data?.claims?.app_metadata?.role === "admin";

  if (pathname === "/admin/login") return response;

  if (isAdmin) {
    // Same reason as orderCheck: an unknown product or order id must answer
    // 404, and the detail pages stream. The rewrite target is a prerendered 404.
    if (await isMissingDetail(supabase, pathname)) {
      const missing = NextResponse.rewrite(new URL("/order/sample", request.url));
      for (const cookie of response.cookies.getAll()) missing.cookies.set(cookie);
      return missing;
    }
    return response;
  }

  const login = request.nextUrl.clone();
  login.pathname = "/admin/login";
  login.search = `?next=${encodeURIComponent(pathname + search)}`;
  const redirect = NextResponse.redirect(login);
  // Keep a refreshed or cleared session cookie on the redirect.
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

// /admin/products/<id> and /admin/orders/<id>. True when the address cannot
// show a record: a bad id, or no row the session can read. The pages keep their
// own notFound() calls as well.
async function isMissingDetail(
  supabase: SupabaseClient,
  pathname: string,
): Promise<boolean> {
  const [, , section, id, ...rest] = pathname.split("/");
  if (!id || rest.length > 0) return false;
  try {
    if (section === "orders") {
      if (!isUuid(id)) return true;
      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      return !error && !data;
    }
    if (section === "products" && id !== "new") {
      if (!/^\d{1,15}$/.test(id)) return true;
      const { data, error } = await supabase
        .from("products")
        .select("id")
        .eq("id", Number(id))
        .maybeSingle();
      return !error && !data;
    }
  } catch {
    // Database not reachable: let the page decide.
  }
  return false;
}

export const config = {
  matcher: ["/order/:id", "/admin/:path*"],
};
