"use server";

import { updateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/supabase-server";
import {
  ERRORS,
  MAX_IMAGE_BYTES,
  SIZES_BY_TYPE,
  parsePriceCents,
  slugify,
  validateProduct,
  type FieldErrors,
  type ProductInput,
} from "@/lib/admin-validation";

const BUCKET = "product-images";

// The public address of a stored file, and the file name inside the bucket.
function bucketPrefix(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
}

function objectName(url: string): string | null {
  const prefix = bucketPrefix();
  if (!url.startsWith(prefix)) return null;
  return decodeURIComponent(url.slice(prefix.length));
}

// Uploads ---------------------------------------------------------------------

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: "invalid" | "failed" };

// The type comes from the file bytes, not from the file name or the browser.
function sniffType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  const at = (i: number) => bytes[i];
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "image/jpeg";
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, i) => at(i) === byte)) return "image/png";
  const ascii = (from: number, text: string) =>
    [...text].every((char, i) => at(from + i) === char.charCodeAt(0));
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  return null;
}

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

// One image per request (DESIGN.md 7.9). The form calls this only on Save.
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const { supabase } = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, reason: "invalid" };
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: "invalid" };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffType(bytes);
  if (!type) return { ok: false, reason: "invalid" };

  const name = `uploads/${crypto.randomUUID()}.${EXTENSIONS[type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(name, bytes, {
    contentType: type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return { ok: false, reason: "failed" };
  return {
    ok: true,
    url: supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl,
  };
}

// Removes files uploaded for a save that then failed. A file that a saved
// image row already uses is never removed.
export async function discardUploads(urls: string[]): Promise<void> {
  const { supabase } = await requireAdmin();
  const candidates = urls.filter((url) => objectName(url)?.startsWith("uploads/"));
  if (candidates.length === 0) return;
  const { data } = await supabase
    .from("product_images")
    .select("path")
    .in("path", candidates);
  const used = new Set((data ?? []).map((row) => row.path));
  const names = candidates
    .filter((url) => !used.has(url))
    .map((url) => objectName(url) as string);
  if (names.length > 0) await supabase.storage.from(BUCKET).remove(names);
}

// Save ------------------------------------------------------------------------

export type SaveResult =
  | { ok: true; id: number; slug: string; images: [string | null, string | null] }
  | { ok: false; errors: FieldErrors }
  | { ok: false; failed: true };

type Db = SupabaseClient;

export async function saveProduct(
  input: ProductInput,
  id: number | null,
): Promise<SaveResult> {
  const { supabase } = await requireAdmin();
  try {
    // Every rule of the form runs again here.
    const errors = validateProduct(input);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return await write(supabase, input, id);
  } catch {
    return { ok: false, failed: true };
  }
}

async function write(
  supabase: Db,
  input: ProductInput,
  id: number | null,
): Promise<SaveResult> {
  const categoryId = Number(input.categoryId);
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle();
  if (!category) return { ok: false, errors: { category: ERRORS.category } };

  // A saved image keeps its path. A new file must be one this form uploaded.
  const existing: { id: number; sort: number; path: string }[] = [];
  if (id !== null) {
    const { data, error } = await supabase
      .from("product_images")
      .select("id, sort, path")
      .eq("product_id", id);
    if (error) throw error;
    existing.push(...(data ?? []));
  }
  for (const slot of input.images) {
    if (!slot) continue;
    const known = existing.some((row) => row.path === slot.path);
    const fresh = objectName(slot.path)?.startsWith("uploads/") ?? false;
    if (!known && !fresh) throw new Error("Unknown image path.");
  }

  const fields = {
    name: input.name.trim(),
    name_ja: input.nameJa.trim() || null,
    description: input.description.trim(),
    price_cents: parsePriceCents(input.price) as number,
    category_id: categoryId,
    is_active: input.isActive,
  };

  let productId: number;
  let slug: string;
  let created = false;
  if (id === null) {
    slug = slugify(fields.name);
    const { data: taken } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (taken) return { ok: false, errors: { name: ERRORS.nameTaken } };
    const { data, error } = await supabase
      .from("products")
      .insert({ ...fields, slug })
      .select("id")
      .single();
    if (error) {
      // A second admin saved the same name between the check and the insert.
      if (error.code === "23505") {
        return { ok: false, errors: { name: ERRORS.nameTaken } };
      }
      throw error;
    }
    productId = data.id;
    created = true;
  } else {
    const { data, error } = await supabase
      .from("products")
      .update(fields)
      .eq("id", id)
      .select("id, slug")
      .single();
    if (error) throw error;
    productId = data.id;
    slug = data.slug;
  }

  try {
    // Sizes: write the chosen type, remove the other rows.
    const sizes = SIZES_BY_TYPE[input.sizeType];
    const { error: sizeError } = await supabase.from("product_variants").upsert(
      sizes.map((size) => ({
        product_id: productId,
        size,
        stock: Number(input.stock[size]),
      })),
      { onConflict: "product_id,size" },
    );
    if (sizeError) throw sizeError;
    const { error: dropError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId)
      .not("size", "in", `(${sizes.map((size) => `"${size}"`).join(",")})`);
    if (dropError) throw dropError;

    // Images: slot 0 is sort 0 (Front), slot 1 is sort 1 (Back or detail).
    for (const sort of [0, 1]) {
      const slot = input.images[sort];
      const row = existing.find((item) => item.sort === sort);
      if (!slot) {
        if (row) {
          const { error } = await supabase
            .from("product_images")
            .delete()
            .eq("id", row.id);
          if (error) throw error;
        }
        continue;
      }
      const values = {
        path: slot.path,
        alt: slot.alt.trim(),
        credit_name: slot.creditName.trim() || null,
        credit_url: slot.creditUrl.trim() || null,
      };
      const { error } = row
        ? await supabase.from("product_images").update(values).eq("id", row.id)
        : await supabase
            .from("product_images")
            .insert({ ...values, product_id: productId, sort });
      if (error) throw error;
    }
  } catch (error) {
    // A new product that could not be completed is not left half saved.
    if (created) await supabase.from("products").delete().eq("id", productId);
    // An edit already changed the product row, so the store must not keep the old copy.
    else updateTag("catalog");
    throw error;
  }

  // Files that no saved image uses any more.
  const kept = new Set(input.images.flatMap((slot) => (slot ? [slot.path] : [])));
  const orphans = existing
    .filter((row) => !kept.has(row.path))
    .map((row) => objectName(row.path))
    .filter((name): name is string => name !== null);
  if (orphans.length > 0) {
    await supabase.storage.from(BUCKET).remove(orphans);
  }

  updateTag("catalog");
  return {
    ok: true,
    id: productId,
    slug,
    images: [input.images[0]?.path ?? null, input.images[1]?.path ?? null],
  };
}

// Delete ----------------------------------------------------------------------

// The product row first, then its stored files. Sizes and images go with the row
// (on delete cascade). Order lines keep their own copy and lose the product id.
export async function deleteProduct(id: number): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin();
  try {
    if (!Number.isInteger(id)) return { ok: false };
    const { data: images, error } = await supabase
      .from("product_images")
      .select("path")
      .eq("product_id", id);
    if (error) throw error;
    const names = (images ?? [])
      .map((row) => objectName(row.path))
      .filter((name): name is string => name !== null);
    const { data, error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id");
    if (deleteError || !data || data.length === 0) return { ok: false };
    updateTag("catalog");
    // The row is gone, so a failed removal only leaves orphan files. The nightly reset deletes them.
    if (names.length > 0) await supabase.storage.from(BUCKET).remove(names);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
