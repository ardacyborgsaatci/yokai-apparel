// Creates or updates the demo admin user. Two callers share it:
// scripts/create-admin.mjs and the /api/reset route.
// Keep this file plain (erasable TypeScript only: types, no enums): Node loads it as is.
// It needs a client made with the secret key. Only the secret key can set app_metadata.
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listAllUsers(supabase: SupabaseClient) {
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 200) return users;
  }
}

export async function ensureDemoAdmin(
  supabase: SupabaseClient,
  demo: { email: string; password: string },
): Promise<{ id: string; created: boolean }> {
  const attrs = {
    email: demo.email,
    password: demo.password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  };

  const users = await listAllUsers(supabase);
  const existing = users.find(
    (u) => u.email?.toLowerCase() === demo.email.toLowerCase(),
  );
  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, attrs);
    if (error) throw error;
    return { id: existing.id, created: false };
  }
  const { data, error } = await supabase.auth.admin.createUser(attrs);
  if (error) throw error;
  return { id: data.user.id, created: true };
}
