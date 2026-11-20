-- Yokai Apparel seed data.
-- The seed itself lives in the function public.reset_demo(), in the migration
-- supabase/migrations/*_reset_demo.sql. Run the migrations first, then this file.
-- It deletes every row the seed does not list (all orders, and products, sizes and
-- images that are not in the seed), then writes the seed rows again: categories,
-- 12 products, sizes with stock, images, and the 6 demo orders (YK-09001 to YK-09006).
-- Safe to run many times. It does not touch storage files or auth users:
-- the /api/reset route does that (see README).

select public.reset_demo();
