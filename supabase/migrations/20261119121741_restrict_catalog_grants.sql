-- Public API roles may only read the catalog. Writes come in Phase 3 with explicit grants and policies.
revoke insert, update, delete, truncate, references, trigger on public.categories from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.products from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.product_images from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.product_variants from anon, authenticated;
