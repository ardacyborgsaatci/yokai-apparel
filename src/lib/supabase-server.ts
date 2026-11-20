import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Session client for the admin: it reads and writes the sign-in cookies, so every
// query runs as the signed-in user and RLS is the guard. The app holds only the
// publishable key. Never cache anything that comes from here.
export async function createSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // A Server Component cannot set cookies. The proxy refreshes the session.
        }
      },
    },
  });
}

// Returns the session client when the signed-in user is the admin. getUser()
// asks the auth server, so a revoked or forged session does not pass.
export async function getAdmin() {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.app_metadata?.role !== "admin") {
    return null;
  }
  return { supabase, user: data.user };
}

// Pages and Server Actions call this first (DESIGN.md 7.1, Session rules).
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
