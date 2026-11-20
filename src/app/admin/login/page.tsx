import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { safeNext } from "@/lib/admin-validation";

export const metadata: Metadata = { title: "Admin login" };

// Login has no top bar and no shell Alert (DESIGN.md 7.1). `next` is checked
// here and again in the sign-in action.
export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const raw = Array.isArray(params.next) ? params.next[0] : params.next;
  return (
    <main
      id="main"
      className="flex min-h-screen items-center justify-center px-4 py-8"
    >
      <LoginForm next={safeNext(raw)} />
    </main>
  );
}
