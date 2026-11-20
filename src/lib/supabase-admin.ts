import "server-only";
import { createClient } from "@supabase/supabase-js";

// Secret-key client. It bypasses RLS. Only the nightly reset route uses it.
// This file and scripts/create-admin.mjs are the only places that read SUPABASE_SECRET_KEY.
export function createSecretClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
