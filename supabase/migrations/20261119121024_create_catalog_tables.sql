create table public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  sort integer not null default 0
);

create table public.products (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  category_id bigint not null references public.categories (id) on delete restrict,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  path text not null,
  alt text not null default '',
  sort integer not null default 0,
  credit_name text,
  credit_url text
);

create table public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);

create index products_category_id_idx on public.products (category_id);
create index product_images_product_id_idx on public.product_images (product_id);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

create policy "Public read categories" on public.categories
  for select to anon, authenticated using (true);

create policy "Public read active products" on public.products
  for select to anon, authenticated using (is_active);

create policy "Public read images of active products" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.is_active));

create policy "Public read variants of active products" on public.product_variants
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.is_active));
