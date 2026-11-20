"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase-server";
import {
  EMAIL_ERROR,
  PASSWORD_ERROR,
  isEmail,
  safeNext,
} from "@/lib/admin-validation";

export type SignInResult =
  | { ok: false; errors: { email?: string; password?: string } }
  | { ok: false; credentials: true };

// Every rule of the Login form runs again here. A wrong password and a user
// who is not the admin give the same answer: "Email or password is wrong."
export async function signIn(input: {
  email: string;
  password: string;
  next: string;
}): Promise<SignInResult> {
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  const errors: { email?: string; password?: string } = {};
  if (!isEmail(email)) errors.email = EMAIL_ERROR;
  if (!password) errors.password = PASSWORD_ERROR;
  if (errors.email || errors.password) return { ok: false, errors };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) return { ok: false, credentials: true };
  if (data.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { ok: false, credentials: true };
  }
  redirect(safeNext(input.next));
}

// Ends the session and opens Login. No toast.
export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
