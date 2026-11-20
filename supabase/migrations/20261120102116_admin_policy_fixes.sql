-- Fixes for the advisor findings on the admin migration. No policy is dropped.
-- 1. auth_rls_initplan: the lint wants auth.jwt() itself wrapped in (select ...).
--    The result is the same. Postgres evaluates it once per statement.
-- 2. multiple_permissive_policies: for role authenticated, each catalog table had
--    two select policies (public and admin). The public policy now covers anon
--    only. The select policy of authenticated reads active rows, or all rows for
--    the admin. Result per role does not change: anon reads active rows only, a
--    signed-in non-admin reads active rows only, the admin reads all rows.

alter policy "Public read active products" on public.products to anon;
alter policy "Public read variants of active products" on public.product_variants to anon;
alter policy "Public read images of active products" on public.product_images to anon;

alter policy "Admin reads all products" on public.products
  rename to "Authenticated reads active products, admin reads all";
alter policy "Authenticated reads active products, admin reads all" on public.products
  using (is_active or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Postgres cuts the next name to 63 characters. Both statements cut it the same way.
alter policy "Admin reads all variants" on public.product_variants
  rename to "Authenticated reads variants of active products, admin reads all";
alter policy "Authenticated reads variants of active products, admin reads all" on public.product_variants
  using (
    exists (select 1 from public.products p where p.id = product_variants.product_id and p.is_active)
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

alter policy "Admin reads all images" on public.product_images
  rename to "Authenticated reads images of active products, admin reads all";
alter policy "Authenticated reads images of active products, admin reads all" on public.product_images
  using (
    exists (select 1 from public.products p where p.id = product_images.product_id and p.is_active)
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

alter policy "Admin inserts products" on public.products
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy "Admin updates products" on public.products
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy "Admin deletes products" on public.products
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "Admin inserts variants" on public.product_variants
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy "Admin updates variants" on public.product_variants
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy "Admin deletes variants" on public.product_variants
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "Admin inserts images" on public.product_images
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy "Admin updates images" on public.product_images
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy "Admin deletes images" on public.product_images
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "Admin reads orders" on public.orders
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy "Admin updates orders" on public.orders
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
alter policy "Admin reads order items" on public.order_items
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
