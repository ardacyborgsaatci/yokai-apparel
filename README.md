# Yokai Apparel

A portfolio demo of a clothing store: dark, minimal streetwear named for Japanese folklore spirits.

**This is a demo. Nothing is sold, shipped or charged.** No real orders, no real payments. The brand is fictional.

## What it does

- Storefront: Home, Shop (all, plus one page per category), Product, About, Shipping & Returns, Image credits.
- Catalog: 12 products in 3 categories (Tees, Hoodies, Accessories). Sizes XS to XL, with stock per size.
- Shop filters: category (links), size (radio group), sort (select). The filter state lives in the URL.
- Market: California only. English. USD.

Planned for later phases: cart drawer, guest checkout with a demo card form, order saving, and an admin area (products and orders).

## Stack

- Next.js 16 (App Router, Cache Components) and React 19
- Tailwind CSS 4
- Supabase (Postgres) for the catalog
- Phosphor icons, Anton, Inter and Noto Sans JP (Japanese names)
- Vercel for hosting

## Demo notes

- Product copy and Japanese names come from public folklore sources. Garment details are generic.
- Photos are credited on the Image credits page. The Home and About photos are converted to black and white.
- Planned checkout: a prefilled test card. Card data stays in the browser. Nothing is stored.
- Data is reset on a schedule in a later phase.

## Run it locally

Needs Node.js 20 or newer and a Supabase project.

1. Install packages.

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root with these variables:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   Take both values from your Supabase project settings (API).

3. Load the data. Run `supabase/seed.sql` in the Supabase SQL editor. It is safe to run again: it puts the seeded rows back to the values in the file. It expects these tables: `categories`, `products` (with `name_ja`), `product_images`, `product_variants`. The table definitions are not in this repo yet.

4. Start the dev server.

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

Other commands:

- `npm run build` builds for production.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.
