-- Admin: policies, grants and the product-images bucket.
-- The admin role is auth.users.raw_app_meta_data.role = 'admin'. Only the secret
-- key can set app_metadata, so a sign-up with the public key never becomes admin.
-- Every admin policy reads the role from the signed JWT, wrapped in (select ...)
-- so Postgres evaluates it once per statement, not once per row.
-- Anon access does not change. The existing public read policies stay as they are.

-- Catalog: admin reads hidden products too, and writes.
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_variants to authenticated;
grant insert, update, delete on public.product_images to authenticated;

create policy "Admin reads all products" on public.products
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin inserts products" on public.products
  for insert to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin updates products" on public.products
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin deletes products" on public.products
  for delete to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin reads all variants" on public.product_variants
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin inserts variants" on public.product_variants
  for insert to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin updates variants" on public.product_variants
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin deletes variants" on public.product_variants
  for delete to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin reads all images" on public.product_images
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin inserts images" on public.product_images
  for insert to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin updates images" on public.product_images
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin deletes images" on public.product_images
  for delete to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Orders: admin reads everything and changes the status column only.
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant update (status) on public.orders to authenticated;

create policy "Admin reads orders" on public.orders
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin updates orders" on public.orders
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin reads order items" on public.order_items
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Storage: one public bucket for product uploads, 2 MB, JPG, PNG or WebP.
-- Public read comes from the public bucket. Only the admin writes. The admin
-- also needs select on the bucket, because delete and update read the row first.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admin reads product images" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images'
         and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin uploads product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images'
              and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin updates product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images'
         and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id = 'product-images'
              and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin deletes product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images'
         and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
