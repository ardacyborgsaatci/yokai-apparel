// Creates or updates the demo admin user. Safe to run again.
// Run once, from the project root:  node scripts/create-admin.mjs
//
// It needs SUPABASE_SECRET_KEY in .env.local. The secret key is used here and in
// src/lib/supabase-admin.ts (the nightly reset route). The browser code never
// gets it. The script never prints a key or the password.
//
// The admin role is app_metadata.role = "admin". Only the secret key can set
// app_metadata, so a sign-up with the public key never becomes admin.
// The create-or-update logic is shared with the /api/reset route.
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import { DEMO_ADMIN } from "../src/lib/demo-admin.ts";
import { ensureDemoAdmin } from "../src/lib/ensure-demo-admin.ts";

try {
  process.loadEnvFile(fileURLToPath(new URL("../.env.local", import.meta.url)));
} catch {
  // No .env.local: the variables may already be in the environment.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { created } = await ensureDemoAdmin(supabase, DEMO_ADMIN);
console.log(`${created ? "Created" : "Updated"} the demo admin: ${DEMO_ADMIN.email}`);
