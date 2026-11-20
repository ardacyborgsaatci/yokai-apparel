import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { DEMO_ADMIN } from "@/lib/demo-admin";
import { ensureDemoAdmin, listAllUsers } from "@/lib/ensure-demo-admin";
import { createSecretClient } from "@/lib/supabase-admin";

// Nightly demo reset. Vercel Cron calls it with GET and
// "Authorization: Bearer <CRON_SECRET>" (vercel.json).
// 1. Database: public.reset_demo() deletes what the seed does not list and writes the seed.
// 2. Storage: removes every file in the product-images bucket.
// 3. Auth: restores the demo admin, deletes every other user.
// 4. Cache: expires the "catalog" tag.
// The response holds counts only. Errors are logged without keys or passwords.

// A reset takes about 7 s. Allow more than a 10 s plan default.
export const maxDuration = 60;

const BUCKET = "product-images";
const NO_STORE = { "Cache-Control": "no-store" };

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = request.headers.get("authorization") ?? "";
  // Compare hashes, so the check takes the same time for any input.
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(a, b);
}

type Bucket = ReturnType<ReturnType<typeof createSecretClient>["storage"]["from"]>;

// Lists every file, folders included (a folder has no id).
async function listObjects(bucket: Bucket, folder = ""): Promise<string[]> {
  const paths: string[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await bucket.list(folder, { limit: 100, offset });
    if (error) throw error;
    for (const item of data) {
      const path = folder ? `${folder}/${item.name}` : item.name;
      if (item.id === null) paths.push(...(await listObjects(bucket, path)));
      else paths.push(path);
    }
    if (data.length < 100) return paths;
  }
}

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "unknown error";
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response(null, { status: 401, headers: NO_STORE });
  }

  let step = "start";
  try {
    const supabase = createSecretClient();

    step = "database";
    const reset = await supabase.rpc("reset_demo");
    if (reset.error) throw reset.error;
    // The database is back to the seed. Expire the catalog now, so the next
    // store request reads fresh data even if a later step fails.
    revalidateTag("catalog", { expire: 0 });

    step = "storage";
    const bucket = supabase.storage.from(BUCKET);
    const objects = await listObjects(bucket);
    for (let i = 0; i < objects.length; i += 100) {
      const { error } = await bucket.remove(objects.slice(i, i + 100));
      if (error) throw error;
    }

    step = "demo admin";
    const admin = await ensureDemoAdmin(supabase, DEMO_ADMIN);

    step = "users";
    const others = (await listAllUsers(supabase)).filter((u) => u.id !== admin.id);
    for (const user of others) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
    }

    step = "counts";
    const [orders, products] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
    ]);
    if (orders.error) throw orders.error;
    if (products.error) throw products.error;

    return Response.json(
      {
        orders: orders.count,
        products: products.count,
        objects_removed: objects.length,
        users_removed: others.length,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error(`Demo reset failed at step "${step}": ${errorText(error)}`);
    return Response.json(
      { error: "Reset failed." },
      { status: 500, headers: NO_STORE },
    );
  }
}
