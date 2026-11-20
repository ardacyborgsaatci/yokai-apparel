// Creates or updates the demo admin user. Safe to run again.
// Run once, from the project root:  node scripts/create-admin.mjs
//
// It needs SUPABASE_SECRET_KEY in .env.local. The secret key is used here only.
// The app and Vercel never get it: they keep the publishable key. The script
// never prints a key or the password.
//
// The admin role is app_metadata.role = "admin". Only the secret key can set
// app_metadata, so a sign-up with the public key never becomes admin.
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import { DEMO_ADMIN } from "../src/lib/demo-admin.ts";

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

async function findUser(email) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 200) return null;
  }
}

const attrs = {
  email: DEMO_ADMIN.email,
  password: DEMO_ADMIN.password,
  email_confirm: true,
  app_metadata: { role: "admin" },
};

const existing = await findUser(DEMO_ADMIN.email.toLowerCase());
if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, attrs);
  if (error) throw error;
  console.log(`Updated the demo admin: ${DEMO_ADMIN.email}`);
} else {
  const { error } = await supabase.auth.admin.createUser(attrs);
  if (error) throw error;
  console.log(`Created the demo admin: ${DEMO_ADMIN.email}`);
}
