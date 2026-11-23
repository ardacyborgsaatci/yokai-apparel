# CLAUDE.md: Yokai Apparel

General working rules live in `~/.claude/CLAUDE.md`. This file holds only the project decisions.
These decisions are settled (grilling session, 2026-11-19). Do not ask them again. Change them only when the user asks.

## Product

- Portfolio prototype of a clothing store for **Yokai Apparel**. Not a real business.
- Market: California only. English. USD.
- Catalog: 12 products, 3 categories (Tees, Hoodies, Accessories). Clothing sizes XS to XL. Stock per size.
- Style: dark, minimal Japanese-folklore streetwear. Charcoal (#1C1C1C) and bone (#EDE6D8), with a touch of red (#B3261E, fills only). Bold type (Anton + Inter). Logo with a yokai mask mark.
- Design spec: `DESIGN.md` (repo root), owned by the "Design System" session. It mirrors `src/app/globals.css`. Do not change color tokens in globals.css without that session.
- One code writer: only this (build) session edits code. The design session writes `DESIGN.md` and the "Design additions" section of this file only, and sends other changes as messages.
- Logo: delivered by the design session (original geometric mask, not a fox or cat). Claude writes all copy.
- Japanese name: each product has `name_ja`, shown small and muted under the English name on card and product page. Values come from the design session with a cited folklore source. Never invent them.
- Motion: until Phase 6, the Lantern hero (DESIGN.md 6.5) is the only designed moment on Home. From Phase 6, the layered parallax hero (DESIGN.md 6.6) replaces it: scroll drift and mouse tilt on the Home hero only, plus a 1px press sink on raised controls (DESIGN.md section 4, Tactile depth). The mobile menu keeps its reveal. Respect prefers-reduced-motion.
- Icons: Phosphor (`@phosphor-icons/react`, `/ssr` import in Server Components), regular weight, 20 or 24 px. No Lucide in the store.
- Controls: borders on interactive controls must pass 3:1 non-text contrast (use border-muted, not border-line). Dividers may stay border-line.
- Images: free-license only (Unsplash, Pexels), credited on a Credits page. 2 per product (front, plus back or detail). Art direction: 4:5 portrait, garment centered on dark seamless background, same light on every shot. Lifestyle photos (Home, About) in black and white. No red tint on photos. If no matching licensed shot exists, use an AI-generated image in the same art direction, marked "AI-generated" on the Credits page. No random web images.
- Known gap (2026-11-20): product photos are still the old Unsplash set (1 per product, light backgrounds). Image source decided (user, 2026-11-23): AI-generated with FLUX.1-schnell, plain garments, 2 per product (front plus a close-up detail), marked "AI-generated" on the Credits page. The three.js render route was tried and closed (user, 2026-11-23). Spec: DESIGN.md 3.3, Product image set. The design session generates the images; this session adds them after Phase 6 ships. No paid credits without the user's approval.
- Copy and humanizer (2026-11-20): run the `humanizer` skill on all store-facing copy and the README. Not on code comments or commit messages.
  - Folklore facts and prices stay unchanged; only the wording may change.
  - Strings that DESIGN.md fixes word for word (checkout, errors, help text, banner, confirmation): humanizer only suggests. Send the suggestions to the design session as one batch; code changes only after DESIGN.md changes.
  - Existing copy: one copy pass after the Phase 2 build. From Phase 3 on, each brief tells the builder to run humanizer on new copy before it reports.
- Name check (web only, 2026-11-19): no brand or US trademark "Yokai Apparel" found. Confirm on USPTO before any real launch.

## Pages

- Store: Home, Shop (all + one page per category), Product, Cart (slide-out drawer), Checkout (shipping, then payment), Order confirmation, About, Shipping & Returns, Image credits.
- Admin: Login, Products (list, create, edit, delete), Orders (list, detail, status: pending, shipped, cancelled).
- Footer line states it is a demo store.

## Rules

- Shop: category filter, size filter, sort (newest, price up, price down). No search.
- Guest checkout only. No customer accounts.
- Tax: flat 7.25% (California base rate), labelled "estimated".
- Shipping: flat $6, free on orders of $100.00 or more. Copy: "Free shipping on orders of $100 or more".
- Payment: full card form UI. Banner "Demo store: no real payment is taken". Prefilled test card 4242 4242 4242 4242. Format check in the browser only. Card data never goes to the server and is never stored. Submit shows a short "processing" state, saves the order as "paid (demo)", then opens the confirmation page. Keep a small payment interface so Stripe can replace the stub later.
- Stock: sold-out sizes show "Sold out". Checkout checks stock again. A saved order reduces stock.
- Admin: one admin role. Demo admin email and password shown on the login page. Uploads max 2 MB, JPG/PNG/WebP only.
- Nightly Vercel cron job reseeds all data, deletes uploads, and keeps Supabase awake (free projects pause after 7 days idle).
- Out of scope: search, order emails, newsletter, wishlist, reviews, analytics, customer accounts, contact form, FAQ, legal pages, custom domain.

## Design additions (Design System session, 2026-11-19)

- Japanese names use Noto Sans JP, weight 500, loaded only for the glyphs used.
- Admin keeps Lucide icons inside stock shadcn components. Phosphor is for the store only.
- Mobile menu stays a disclosure (not a dialog). Escape closes it and returns focus to the Menu button.

## Stack

- Next.js (App Router). Tailwind for the store. shadcn/ui in the admin only.
- Supabase free project `yokai-apparel`, region `us-west-1`, org "arda": database, admin auth, image storage. Keep the old "arda" project paused (free plan allows 2 active projects).
- Vercel team "arda", Hobby plan, `*.vercel.app` address. Hobby is non-commercial only; a real launch needs Pro.
- Code in this folder (`1119`). Public GitHub repo `yokai-apparel`, created with `gh`. Vercel deploys on push.

## Process

- 6 phases. Each ends with a sub-agent review and a user check.
  1. Setup and store front: repo, schema, seed data, images, credits, logo, Home, Shop, Product, About, Shipping & Returns, Credits. First deploy.
     Then a fix pass for the design list: control borders, name_ja, motion, 2 images per product, Phosphor icons, new logo.
  2. Cart and checkout: drawer, shipping step, demo payment, stock check, order save, confirmation.
     - Cart drawer: Radix Dialog (focus trap), brand styled, corners per DESIGN.md 2.4. "Add to cart" opens it and shows the added item. Quantity stepper, remove, subtotal, Checkout button, one line "$X.XX away from free shipping".
     - Checkout: one page, two steps. Payment unlocks when Shipping is valid; Shipping collapses to a summary with an "Edit" link. Desktop: sticky order summary in a right column. Mobile: order summary collapsed at top, shows the total.
     - Forms: check each field on blur, error text under the field, on submit with errors move focus to the first bad field. No error summary box. Errors use the error color + icon + text, never color alone (DESIGN.md 2.1).
     - Busy states: no skeletons. Buttons show "Adding..." / "Processing..." only while real work is pending. Busy buttons use aria-disabled, keep focus and keep full color. Payment "Processing..." about 1.5 s, then confirmation. No toasts in the store. Admin uses shadcn Sonner toasts.
     - Phase 2 design source: DESIGN.md 6.1 to 6.4 (checkout layout, shipping fields, money rules, step bars, confirmation, edge states). Lantern hero (6.5) is the last Phase 2 task; cut it if the phase goes over budget.
  3. Admin: login, product CRUD with upload, orders list and detail with status changes.
     - Checkout rule added with the admin: a cart line whose product is deleted or hidden (is_active false) counts as sold out (DESIGN.md 6.4 flow and copy; name from the cart's own copy). Update place_order in the same step.
     - Phase 3 design source: DESIGN.md section 7 and 2.8, plus 3.1 header lockup fix, Credits rule and build notes 7.9. Phase 3 adds the 6 seed orders; the reset logic waits for Phase 4.
  4. Demo reset cron (deletes every row the seed does not list, plus all uploads, then writes the seed), then final review of all pages at all widths.
  5. Polish: the new palette (DESIGN.md 2.1), corner radius (8px controls, 12px containers), the garment rail hero (replaces the Lantern), new product images (AI-generated, DESIGN.md 3.3), admin 404 (DESIGN.md 7.7). Ends with a review of all pages at all widths.
     - The radius spec is in DESIGN.md 2.4. The rail hero and the new images are deferred (user, 2026-11-21); their specs come later from the design session, with new wording for the CLAUDE.md lines they affect (16, 19, 22, 68). Images: built after Phase 6 (user, 2026-11-22).
  6. Depth: a layered parallax Home hero (replaces the Lantern) and soft tactile depth on controls and panels. Spec: DESIGN.md 6.6 and section 4, Tactile depth (approved by the user, 2026-11-21; prototype https://claude.ai/artifact/KbWEawesbFdc8ChFFZ8Vpv). After Phase 6, no new design directions until it ships (user, 2026-11-21).
- Design freeze: once a phase's fix pass or build brief starts, new design items go to the next phase's brief. The running build does not change.
- Builder sub-agents: Sonnet. Reviewer sub-agent: Haiku.
- Test matrix: see the Test matrix section below.

## Test matrix

Run on every page. Report pass or fail per item. Tool: Playwright CLI.

- Widths: 375, 768, 1280, 1440 px.
- Keyboard navigation.
- Text contrast (WCAG AA): inject axe-core from the CDN (`https://cdn.jsdelivr.net/npm/axe-core@4/axe.min.js`) and run `axe.run()` with the `color-contrast` rule at each width. Report the violation count and each failing selector. Zero violations is a pass.
- Incomplete items: report each axe "incomplete" item (text on images or gradients) and check it by hand.
- Control borders: check by hand that every interactive control's border (inputs, selects, size buttons, steppers) uses `border-muted`, not `border-line`, and reaches 3:1 against the background behind it. List each control with its border color and pass or fail.

## Working with other sessions

- Before you offer the user a change to a phase, ask the build session whether that phase has started.
- After a peer session restarts, ask whether it still has a message queued before you send it again.
- A brief for a spec document tells the builder: do not write a new rule or new wording into the spec. List each addition as a question in the report.
- A brief for a spec document asks only for checks specific to that page. For the standard checks, it points to the test matrix above.
- If another session owns a contract file, send it the change in the same step.
