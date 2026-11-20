# Yokai Apparel

A portfolio demo of a clothing store: dark, minimal streetwear named for Japanese folklore spirits.

**This is a demo. Nothing is sold, shipped or charged.** The brand is fictional.

## What it does

- Storefront: Home, Shop (all, plus one page per category), Product, About, Shipping & Returns, Image credits.
- Cart and checkout: a cart drawer, guest checkout with a demo card form, saved orders and an order confirmation page.
- Admin: sign-in, a product list with create, edit and delete (with image upload), and an order list with a detail page where you change the status (pending, shipped, cancelled). There is one admin role. The login page shows the demo email and password.
- Catalog: 12 products in 3 categories (Tees, Hoodies, Accessories). Sizes XS to XL, with stock per size.
- Shop filters: category (links), size (radio group), sort (select). The filter state lives in the URL.
- Market: California only. English. USD.

## Stack

- Next.js 16 (App Router, Cache Components) and React 19
- Tailwind CSS 4 for the store, shadcn/ui for the admin
- Supabase (Postgres, Auth, Storage) for the catalog, orders, admin sign-in and uploads
- Phosphor icons, Anton, Inter and Noto Sans JP (Japanese names)
- Vercel for hosting and the nightly cron job

## Demo notes

- Product copy and Japanese names come from public folklore sources. Garment details are generic.
- Photos are credited on the Image credits page. The Home and About photos are converted to black and white.
- Checkout uses a prefilled test card. Card data stays in the browser. The server never receives it.
- Everything resets every night. A Vercel cron job calls `/api/reset` once a day at 11:00 UTC (3 or 4 AM in California). The route restores the seed data and removes what the seed does not list: it deletes all orders and restarts order numbers at YK-10000, deletes products that are not in the seed, empties the image bucket, resets the demo admin and deletes every other user. The seed has 12 products and 6 demo orders (YK-09001 to YK-09006). The daily database call also keeps the free Supabase project from pausing after a week of no use.
- `/api/reset` answers only a request with the header `Authorization: Bearer <CRON_SECRET>`. Vercel sends that header when `CRON_SECRET` is set in the project. Any other request gets a 401.
- The order functions (`place_order` and `get_order`) are open to anyone with the public key, with no rate limit. That is fine for a demo and must change before a real launch.

## Environment variables

Set these in `.env.local` and in the Vercel project settings. Never commit values.

| Name | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | store, admin, scripts | From Supabase project settings (API). |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | store, admin | From the same page. Safe for the browser. |
| `SUPABASE_SECRET_KEY` | `/api/reset`, `scripts/create-admin.mjs` | Bypasses row-level security. Server only. |
| `CRON_SECRET` | `/api/reset` | Any long random string. Vercel Cron sends it as a bearer token. |

## Run it locally

Needs Node.js 22.18 or newer (the admin script loads TypeScript files) and a Supabase project.

1. Install packages.

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root with the four variables above.

3. Set up the database, in this order:

   1. Apply the files in `supabase/migrations/` in file name order. They create the catalog and orders tables, the admin policies, the `product-images` bucket and the `reset_demo()` function.
   2. Run `supabase/seed.sql` in the Supabase SQL editor. It calls `reset_demo()`, which deletes every order and every product the seed does not list, then writes the seed. Do not run it on data you want to keep.
   3. Create the demo admin.

      ```bash
      node scripts/create-admin.mjs
      ```

4. Start the dev server.

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. The admin is at http://localhost:3000/admin.

To try the nightly reset by hand, with the server running:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/reset
```

It returns the counts of orders and products after the reset, the files removed and the users removed.

Other commands:

- `npm run build` builds for production.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.
