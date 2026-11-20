-- Yokai Apparel seed data.
-- Idempotent: safe to run many times. Each run puts seeded rows back to the values below
-- (stock, price, copy, images). It never deletes anything: rows that are not in this file stay.
-- Prices are in cents. Product photos: see /credits in the app.

begin;

-- Categories ---------------------------------------------------------------

insert into public.categories (slug, name, sort) values
  ('tees', 'Tees', 1),
  ('hoodies', 'Hoodies', 2),
  ('accessories', 'Accessories', 3)
on conflict (slug) do update
  set name = excluded.name, sort = excluded.sort;

-- Products -----------------------------------------------------------------

create temp table seed_products (
  slug text primary key,
  name text not null,
  name_ja text not null,
  description text not null,
  price_cents integer not null,
  category_slug text not null,
  created_at timestamptz not null
) on commit drop;

-- name_ja values and their folklore sources: DESIGN.md section 3.2.
-- Descriptions use only the folklore facts from the Design System session.
insert into seed_products (slug, name, name_ja, description, price_cents, category_slug, created_at) values
  ('kitsune-tee', 'Kitsune Tee', '狐',
   'White cotton tee. Relaxed fit, ribbed collar. Foxes are said to shapeshift and deceive people. They are also messengers of Inari, the rice deity.',
   3800, 'tees', '2026-10-02 12:00:00+00'),
  ('oni-tee', 'Oni Tee', '鬼',
   'Black cotton tee. Boxy cut. Oni are horned demons. They are usually shown in tiger-skin loincloths, with spiked iron clubs.',
   4200, 'tees', '2026-11-01 12:00:00+00'),
  ('tanuki-tee', 'Tanuki Tee', '狸',
   'White cotton tee. Straight hem, soft feel. In folktales the tanuki shapeshifts and tricks people, like the fox.',
   3500, 'tees', '2026-10-05 12:00:00+00'),
  ('kappa-tee', 'Kappa Tee', '河童',
   'Black cotton tee in dense jersey. Short sleeves, clean neckline. The kappa is a water yokai. Its strength depends on the water in the dish on its head.',
   4000, 'tees', '2026-10-10 12:00:00+00'),
  ('tengu-tee', 'Tengu Tee', '天狗',
   'White cotton tee. Slim, tall cut. Tengu are mountain yokai, usually red-faced and long-nosed, in yamabushi robes. They can fly.',
   4500, 'tees', '2026-10-18 12:00:00+00'),
  ('nue-hoodie', 'Nue Hoodie', '鵺',
   'Black pullover hoodie in brushed fleece. Deep hood, front pocket. The nue is usually described with a monkey face, a tanuki body, tiger limbs and a snake tail. Minamoto no Yorimasa shot one.',
   8500, 'hoodies', '2026-10-12 12:00:00+00'),
  ('yurei-hoodie', 'Yurei Hoodie', '幽霊',
   'White fleece hoodie. Relaxed through the body. A yurei is the spirit of a dead person who cannot rest. It is often shown in white burial robes, without feet.',
   8800, 'hoodies', '2026-10-28 12:00:00+00'),
  ('jorogumo-hoodie', 'Jorogumo Hoodie', '絡新婦',
   'Heavy black hoodie. Double-layer hood, ribbed cuffs. The jorogumo is a spider yokai. It is said to turn into a beautiful woman.',
   9500, 'hoodies', '2026-11-10 12:00:00+00'),
  ('kodama-hoodie', 'Kodama Hoodie', '木霊',
   'Heather grey hoodie in cotton fleece. Easy fit, drawstring hood. A kodama is a tree spirit. Cutting its tree is said to bring a curse.',
   7800, 'hoodies', '2026-10-22 12:00:00+00'),
  ('kasa-cap', 'Kasa Cap', '傘おばけ',
   'Black and white trucker cap. Mesh back, adjustable fit. The kasa is an umbrella yokai. It is usually drawn with one eye, hopping on one leg.',
   3500, 'accessories', '2026-11-05 12:00:00+00'),
  ('baku-tote', 'Baku Tote', '獏',
   'Black cotton tote with long straps. The baku is a legendary beast of Chinese origin. In Japan it is said to eat nightmares.',
   4000, 'accessories', '2026-10-15 12:00:00+00'),
  ('bakeneko-beanie', 'Bakeneko Beanie', '化け猫',
   'Dark grey knit beanie with a deep cuff. Old cats are said to become bakeneko. They can shapeshift, speak and curse people.',
   3800, 'accessories', '2026-10-25 12:00:00+00');

insert into public.products (slug, name, name_ja, description, price_cents, category_id, created_at, is_active)
select s.slug, s.name, s.name_ja, s.description, s.price_cents, c.id, s.created_at, true
from seed_products s
join public.categories c on c.slug = s.category_slug
on conflict (slug) do update
  set name = excluded.name,
      name_ja = excluded.name_ja,
      description = excluded.description,
      price_cents = excluded.price_cents,
      category_id = excluded.category_id,
      created_at = excluded.created_at,
      is_active = true;

-- Variants (size and stock) ------------------------------------------------

create temp table seed_variants (
  product_slug text not null,
  size text not null,
  stock integer not null
) on commit drop;

insert into seed_variants (product_slug, size, stock) values
  ('kitsune-tee', 'XS', 4), ('kitsune-tee', 'S', 12), ('kitsune-tee', 'M', 10), ('kitsune-tee', 'L', 6), ('kitsune-tee', 'XL', 0),
  ('oni-tee', 'XS', 0), ('oni-tee', 'S', 8), ('oni-tee', 'M', 14), ('oni-tee', 'L', 9), ('oni-tee', 'XL', 5),
  ('tanuki-tee', 'XS', 3), ('tanuki-tee', 'S', 7), ('tanuki-tee', 'M', 0), ('tanuki-tee', 'L', 11), ('tanuki-tee', 'XL', 4),
  ('kappa-tee', 'XS', 5), ('kappa-tee', 'S', 9), ('kappa-tee', 'M', 12), ('kappa-tee', 'L', 0), ('kappa-tee', 'XL', 0),
  ('tengu-tee', 'XS', 6), ('tengu-tee', 'S', 10), ('tengu-tee', 'M', 8), ('tengu-tee', 'L', 7), ('tengu-tee', 'XL', 3),
  ('nue-hoodie', 'XS', 2), ('nue-hoodie', 'S', 6), ('nue-hoodie', 'M', 9), ('nue-hoodie', 'L', 5), ('nue-hoodie', 'XL', 0),
  ('yurei-hoodie', 'XS', 0), ('yurei-hoodie', 'S', 4), ('yurei-hoodie', 'M', 7), ('yurei-hoodie', 'L', 6), ('yurei-hoodie', 'XL', 3),
  ('jorogumo-hoodie', 'XS', 0), ('jorogumo-hoodie', 'S', 0), ('jorogumo-hoodie', 'M', 3), ('jorogumo-hoodie', 'L', 4), ('jorogumo-hoodie', 'XL', 2),
  ('kodama-hoodie', 'XS', 4), ('kodama-hoodie', 'S', 8), ('kodama-hoodie', 'M', 10), ('kodama-hoodie', 'L', 8), ('kodama-hoodie', 'XL', 6),
  ('kasa-cap', 'One Size', 25),
  ('baku-tote', 'One Size', 18),
  ('bakeneko-beanie', 'One Size', 3);

insert into public.product_variants (product_id, size, stock)
select p.id, v.size, v.stock
from seed_variants v
join public.products p on p.slug = v.product_slug
on conflict (product_id, size) do update
  set stock = excluded.stock;

-- Images -------------------------------------------------------------------
-- Paths point to files in public/images. Credits are shown on /credits.

create temp table seed_images (
  product_slug text not null,
  path text not null,
  alt text not null,
  sort integer not null,
  credit_name text not null,
  credit_url text not null
) on commit drop;

insert into seed_images (product_slug, path, alt, sort, credit_name, credit_url) values
  ('kitsune-tee', '/images/kitsune-tee-1.webp', 'Plain white t-shirt on a wooden hanger against a pale wall', 0, 'Avtar Singh', 'https://unsplash.com/photos/8ACmRoleM24'),
  ('kitsune-tee', '/images/kitsune-tee-2.webp', 'White crew-neck t-shirt worn on the body', 1, 'Anomaly', 'https://unsplash.com/photos/WWesmHEgXDs'),
  ('oni-tee', '/images/oni-tee-1.webp', 'Black t-shirts on wooden hangers against a white background', 0, 'Ryan Hoffman', 'https://unsplash.com/photos/Cs4GVbMqKGY'),
  ('tanuki-tee', '/images/tanuki-tee-1.webp', 'White t-shirt on a hanger against a dark concrete wall', 0, 'Haryo Setyadi', 'https://unsplash.com/photos/acn5ERAeSb4'),
  ('kappa-tee', '/images/kappa-tee-1.webp', 'Two black t-shirts hanging side by side', 0, 'Md Salman', 'https://unsplash.com/photos/iiqg2xbmvk0'),
  ('tengu-tee', '/images/tengu-tee-1.webp', 'White t-shirt laid flat on a light background', 0, 'mockupbee', 'https://unsplash.com/photos/4rUYuwJ2vGw'),
  ('nue-hoodie', '/images/nue-hoodie-1.webp', 'Person in a dark hoodie with the hood up and arms crossed', 0, 'Philipp Lansing', 'https://unsplash.com/photos/REOoETloFqE'),
  ('yurei-hoodie', '/images/yurei-hoodie-1.webp', 'White hoodie on a hanger beside dried leaves', 0, 'Mediamodifier', 'https://unsplash.com/photos/kJXGTOY1wLQ'),
  ('jorogumo-hoodie', '/images/jorogumo-hoodie-1.webp', 'Person in a black hoodie holding the hood in a dark room', 0, 'MEHRAX', 'https://unsplash.com/photos/r-fZqxXDG-8'),
  ('kodama-hoodie', '/images/kodama-hoodie-1.webp', 'Back view of a person in a grey pullover hoodie', 0, 'Jannes Jacobs', 'https://unsplash.com/photos/a_KC8ocB650'),
  ('kasa-cap', '/images/kasa-cap-1.webp', 'Black and white trucker cap on a white background', 0, 'Fabio T.', 'https://unsplash.com/photos/SJmPgqY4Hrk'),
  ('baku-tote', '/images/baku-tote-1.webp', 'Hand holding a black cotton tote bag against a white wall', 0, 'He''s Her Lobster', 'https://unsplash.com/photos/9b6UhV4nLZs'),
  ('bakeneko-beanie', '/images/bakeneko-beanie-1.webp', 'Dark grey knit beanie on a white background', 0, 'Ryan Hoffman', 'https://unsplash.com/photos/2BK0JEwQSpQ');

update public.product_images pi
set alt = i.alt, sort = i.sort, credit_name = i.credit_name, credit_url = i.credit_url
from seed_images i
join public.products p on p.slug = i.product_slug
where pi.product_id = p.id and pi.path = i.path;

insert into public.product_images (product_id, path, alt, sort, credit_name, credit_url)
select p.id, i.path, i.alt, i.sort, i.credit_name, i.credit_url
from seed_images i
join public.products p on p.slug = i.product_slug
where not exists (
  select 1 from public.product_images pi where pi.product_id = p.id and pi.path = i.path
);


-- Demo orders (YK-09001 to YK-09006) ---------------------------------------
-- Order numbers below 10000 never clash with checkout orders (the sequence starts at 10000).
-- Money follows the checkout rules: shipping $6, free from $100.00; tax 7.25%, rounded to the cent.
-- These orders do not change stock. Lines are written once, for an order that has none.

create temp table seed_orders (
  id uuid primary key,
  order_number text not null unique,
  email text not null,
  full_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  zip text not null,
  status text not null,
  age interval not null
) on commit drop;

insert into seed_orders (id, order_number, email, full_name, address_line1, address_line2, city, zip, status, age) values
  ('5eed0000-0000-4000-8000-000000009001', 'YK-09001', 'ana@example.com', 'Ana Rivera', '1420 Alameda St', 'Apt 3', 'Los Angeles', '90012', 'shipped', interval '6 days 4 hours'),
  ('5eed0000-0000-4000-8000-000000009002', 'YK-09002', 'sam@example.com', 'Sam Okafor', '88 Pine Ave', null, 'San Diego', '92101', 'shipped', interval '5 days 2 hours'),
  ('5eed0000-0000-4000-8000-000000009003', 'YK-09003', 'mia@example.com', 'Mia Chen', '2300 Telegraph Ave', null, 'Berkeley', '94704', 'cancelled', interval '4 days 7 hours'),
  ('5eed0000-0000-4000-8000-000000009004', 'YK-09004', 'lena@example.com', 'Lena Park', '515 Mission St', 'Unit 12', 'San Francisco', '94105', 'pending', interval '3 days 1 hour'),
  ('5eed0000-0000-4000-8000-000000009005', 'YK-09005', 'diego@example.com', 'Diego Alvarez', '77 Capitol Mall', null, 'Sacramento', '95814', 'pending', interval '2 days 5 hours'),
  ('5eed0000-0000-4000-8000-000000009006', 'YK-09006', 'priya@example.com', 'Priya Nair', '910 Higuera St', null, 'San Luis Obispo', '93401', 'pending', interval '9 hours');

create temp table seed_order_lines (
  order_number text not null,
  product_slug text not null,
  size text not null,
  qty integer not null
) on commit drop;

insert into seed_order_lines (order_number, product_slug, size, qty) values
  ('YK-09001', 'nue-hoodie', 'M', 1), ('YK-09001', 'kasa-cap', 'One Size', 1),
  ('YK-09002', 'oni-tee', 'L', 2),
  ('YK-09003', 'yurei-hoodie', 'S', 1), ('YK-09003', 'baku-tote', 'One Size', 1), ('YK-09003', 'bakeneko-beanie', 'One Size', 1),
  ('YK-09004', 'kitsune-tee', 'M', 1),
  ('YK-09005', 'kodama-hoodie', 'L', 1), ('YK-09005', 'tanuki-tee', 'S', 1),
  ('YK-09006', 'tengu-tee', 'M', 1), ('YK-09006', 'kappa-tee', 'S', 1);

insert into public.orders (
  id, order_number, email, full_name, address_line1, address_line2, city, state, zip,
  subtotal_cents, shipping_cents, tax_cents, total_cents, payment_status, status, created_at
)
select o.id, o.order_number, o.email, o.full_name, o.address_line1, o.address_line2, o.city, 'CA', o.zip,
       t.subtotal, m.shipping, m.tax, t.subtotal + m.shipping + m.tax, 'paid_demo', o.status, now() - o.age
from seed_orders o
join (
  select l.order_number, sum(p.price_cents * l.qty)::integer as subtotal
  from seed_order_lines l
  join public.products p on p.slug = l.product_slug
  group by l.order_number
) t on t.order_number = o.order_number
cross join lateral (
  select case when t.subtotal >= 10000 then 0 else 600 end as shipping,
         ((t.subtotal::bigint * 725 + 5000) / 10000)::integer as tax
) m
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      address_line1 = excluded.address_line1,
      address_line2 = excluded.address_line2,
      city = excluded.city,
      state = excluded.state,
      zip = excluded.zip,
      subtotal_cents = excluded.subtotal_cents,
      shipping_cents = excluded.shipping_cents,
      tax_cents = excluded.tax_cents,
      total_cents = excluded.total_cents,
      payment_status = excluded.payment_status,
      status = excluded.status,
      created_at = excluded.created_at;

insert into public.order_items (
  order_id, product_id, product_name, product_name_ja, image_path, size,
  unit_price_cents, quantity, line_total_cents
)
select o.id, p.id, p.name, p.name_ja,
       (select i.path from public.product_images i where i.product_id = p.id order by i.sort, i.id limit 1),
       l.size, p.price_cents, l.qty, p.price_cents * l.qty
from seed_order_lines l
join seed_orders o on o.order_number = l.order_number
join public.products p on p.slug = l.product_slug
where not exists (select 1 from public.order_items oi where oi.order_id = o.id)
order by l.order_number, l.product_slug, l.size;

commit;
