-- Orders: tables, sequence and the two functions the store calls.
-- Anon cannot read or write the tables directly. RLS is on and no policy exists.
-- The store calls place_order and get_order (security definer) with the publishable key.

create sequence public.order_number_seq start with 10000 minvalue 10000;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- "YK-" and 5 digits (10000 to 99999).
  order_number text not null unique
    default ('YK-' || nextval('public.order_number_seq')::text),
  email text not null,
  full_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null default 'CA' check (state = 'CA'),
  zip text not null check (zip ~ '^[0-9]{5}$'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  tax_cents integer not null check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  payment_status text not null default 'paid_demo',
  status text not null default 'pending'
    check (status in ('pending', 'shipped', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  -- Kept as a link only. The snapshot columns below are the record.
  product_id bigint references public.products (id) on delete set null,
  product_name text not null,
  product_name_ja text,
  image_path text,
  size text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity >= 1),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.orders from public, anon, authenticated;
revoke all on public.order_items from public, anon, authenticated;
revoke all on sequence public.order_number_seq from public, anon, authenticated;

-- place_order(items, shipping)
-- items:    [{"slug": text, "size": text, "quantity": 1..99}, ...] (1 to 20 lines)
-- shipping: {"email", "full_name", "address_line1", "address_line2", "city", "zip"}
-- Returns one of:
--   {"status": "ok", "order_id": uuid, "order_number": text}
--   {"status": "stock", "failures": [{"slug", "size", "requested", "available"}]}
--   {"status": "invalid", "message": text}
-- Prices come from public.products. The caller never sends money.
create function public.place_order(items jsonb, shipping jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := btrim(coalesce(shipping ->> 'email', ''));
  v_name text := btrim(coalesce(shipping ->> 'full_name', ''));
  v_line1 text := btrim(coalesce(shipping ->> 'address_line1', ''));
  v_line2 text := nullif(btrim(coalesce(shipping ->> 'address_line2', '')), '');
  v_city text := btrim(coalesce(shipping ->> 'city', ''));
  v_zip text := btrim(coalesce(shipping ->> 'zip', ''));
  v_req jsonb;
  v_fail jsonb;
  v_subtotal bigint;
  v_shipping integer;
  v_tax integer;
  v_order_id uuid;
  v_order_number text;
begin
  -- Validate shipping.
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(v_email) > 254 then
    return jsonb_build_object('status', 'invalid', 'message', 'Invalid email.');
  end if;
  if v_name = '' or length(v_name) > 200
     or v_line1 = '' or length(v_line1) > 200
     or coalesce(length(v_line2), 0) > 200
     or v_city = '' or length(v_city) > 100 then
    return jsonb_build_object('status', 'invalid', 'message', 'Invalid shipping details.');
  end if;
  if v_zip !~ '^[0-9]{5}$' then
    return jsonb_build_object('status', 'invalid', 'message', 'Invalid ZIP code.');
  end if;

  -- Validate items.
  if items is null
     or jsonb_typeof(items) <> 'array'
     or jsonb_array_length(items) not between 1 and 20 then
    return jsonb_build_object('status', 'invalid', 'message', 'A cart has 1 to 20 lines.');
  end if;
  if exists (
    select 1
    from jsonb_array_elements(items) as e
    where jsonb_typeof(e) <> 'object'
       or jsonb_typeof(e -> 'slug') is distinct from 'string'
       or jsonb_typeof(e -> 'size') is distinct from 'string'
       or jsonb_typeof(e -> 'quantity') is distinct from 'number'
       or (e ->> 'quantity') !~ '^[1-9][0-9]?$'
  ) then
    return jsonb_build_object('status', 'invalid', 'message', 'Invalid cart line.');
  end if;

  -- One row per slug and size, quantities added.
  select jsonb_agg(
           jsonb_build_object('slug', g.slug, 'size', g.size, 'qty', g.qty)
           order by g.slug, g.size
         )
    into v_req
    from (
      select e ->> 'slug' as slug,
             e ->> 'size' as size,
             sum((e ->> 'quantity')::integer)::integer as qty
        from jsonb_array_elements(items) as e
       group by 1, 2
    ) as g;

  -- Lock the variant rows in a fixed order, so two orders cannot deadlock.
  perform 1
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    join jsonb_to_recordset(v_req) as r(slug text, size text, qty integer)
      on r.slug = p.slug and r.size = pv.size
   order by pv.id
     for update of pv;

  -- Stock check. A missing or inactive product counts as zero stock.
  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'slug', r.slug,
               'size', r.size,
               'requested', r.qty,
               'available', case when p.is_active then coalesce(pv.stock, 0) else 0 end
             )
             order by r.slug, r.size
           ),
           '[]'::jsonb
         )
    into v_fail
    from jsonb_to_recordset(v_req) as r(slug text, size text, qty integer)
    left join public.products p on p.slug = r.slug
    left join public.product_variants pv on pv.product_id = p.id and pv.size = r.size
   where (case when p.is_active then coalesce(pv.stock, 0) else 0 end) < r.qty;

  if jsonb_array_length(v_fail) > 0 then
    return jsonb_build_object('status', 'stock', 'failures', v_fail);
  end if;

  -- Money, in cents. Subtotal from database prices.
  select sum(p.price_cents::bigint * r.qty)
    into v_subtotal
    from jsonb_to_recordset(v_req) as r(slug text, size text, qty integer)
    join public.products p on p.slug = r.slug;

  v_shipping := case when v_subtotal >= 10000 then 0 else 600 end;
  v_tax := ((v_subtotal * 725 + 5000) / 10000)::integer;

  insert into public.orders (
    email, full_name, address_line1, address_line2, city, state, zip,
    subtotal_cents, shipping_cents, tax_cents, total_cents
  ) values (
    v_email, v_name, v_line1, v_line2, v_city, 'CA', v_zip,
    v_subtotal::integer, v_shipping, v_tax, v_subtotal::integer + v_shipping + v_tax
  )
  returning id, order_number into v_order_id, v_order_number;

  insert into public.order_items (
    order_id, product_id, product_name, product_name_ja, image_path, size,
    unit_price_cents, quantity, line_total_cents
  )
  select v_order_id, p.id, p.name, p.name_ja,
         (select i.path from public.product_images i
           where i.product_id = p.id order by i.sort, i.id limit 1),
         r.size, p.price_cents, r.qty, p.price_cents * r.qty
    from jsonb_to_recordset(v_req) as r(slug text, size text, qty integer)
    join public.products p on p.slug = r.slug
   order by r.slug, r.size;

  update public.product_variants pv
     set stock = pv.stock - r.qty
    from jsonb_to_recordset(v_req) as r(slug text, size text, qty integer),
         public.products p
   where p.slug = r.slug and pv.product_id = p.id and pv.size = r.size;

  return jsonb_build_object(
    'status', 'ok',
    'order_id', v_order_id,
    'order_number', v_order_number
  );
end;
$$;

-- get_order(order_id)
-- One order with its lines, or null. It does not return the email.
create function public.get_order(order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'full_name', o.full_name,
    'address_line1', o.address_line1,
    'address_line2', o.address_line2,
    'city', o.city,
    'state', o.state,
    'zip', o.zip,
    'subtotal_cents', o.subtotal_cents,
    'shipping_cents', o.shipping_cents,
    'tax_cents', o.tax_cents,
    'total_cents', o.total_cents,
    'items', coalesce(
      (select jsonb_agg(
                jsonb_build_object(
                  'product_name', i.product_name,
                  'product_name_ja', i.product_name_ja,
                  'image_path', i.image_path,
                  'size', i.size,
                  'unit_price_cents', i.unit_price_cents,
                  'quantity', i.quantity,
                  'line_total_cents', i.line_total_cents
                )
                order by i.id
              )
         from public.order_items i
        where i.order_id = o.id),
      '[]'::jsonb
    )
  )
  from public.orders o
  where o.id = get_order.order_id;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.get_order(uuid) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb) to anon;
grant execute on function public.get_order(uuid) to anon;
