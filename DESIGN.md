# DESIGN.md: Yokai Apparel

## 1. Purpose and ownership

- This file is the design spec for the Yokai Apparel store UI. The Design System session owns it (`CLAUDE.md:12`).
- The build session is the only code writer (`CLAUDE.md:13`). The Design System session writes this file only. It sends change requests as messages.
- The only token source is `src/app/globals.css`, the `@theme` block (`globals.css:6-14`). This file describes the tokens. It never defines other values. If this file and `globals.css` disagree, `globals.css` is right and this file has a bug.
- Product decisions live in `CLAUDE.md`. This file does not repeat them unless a UI rule needs them.
- Citations use `file:line`. They were checked on 2026-11-19.

### 1.1 Code that does not match this spec yet

The build session fixes these. Each row is a gap, not a design choice.

| Spec | Code today |
| --- | --- |
| Control borders use `border-muted` | `border-line` on filter chips (`shop-view.tsx:29-30`), Menu button (`site-nav.tsx:57`), size chips (`purchase-panel.tsx:40`) |
| Category filter stays links. Size filter is a native radio group drawn as chips. Sort is a native `<select>` | Size and sort are link chips (`shop-view.tsx:13-36`, `76-113`) |
| Suspense fallback is a plain block of the same height: no shimmer, no fake content shapes | `ShopSkeleton` (`shop-view.tsx:147-160`), `ProductSkeleton` (`products/[slug]/page.tsx:73-86`), used as Suspense fallbacks (`shop/page.tsx:13`, `shop/[category]/page.tsx:28`, `products/[slug]/page.tsx:90`) |
| `html` has `scroll-padding-top` equal to the header height (WCAG 2.4.11) | No `scroll-padding` anywhere in `src/` |
| Card price is bone, `font-semibold` | Muted (`product-card.tsx:37`) |
| `animate-rise` only on the mobile menu (the Lantern hero replaces it on Home, section 6.5) | Also on the Home hero (`page.tsx:41-58`) and the gallery image (`gallery.tsx:29`) |
| Escape returns focus to the Menu button | Escape closes the menu only (`site-nav.tsx:21-26`) |
| Header has a cart. Links sit in the center. Mobile order: Menu, logo, cart | No cart. Logo left, links right (`site-header.tsx:16-32`). Mobile: logo, then Menu (`site-nav.tsx:51-60`) |
| Footer links: About, Shipping & Returns, Image credits | Also "Shop all" (`site-footer.tsx:4`) |
| Product card shows the Japanese name under the English name | Shows the category name (`product-card.tsx:41`). No `name_ja` in the catalog type (`catalog.ts:35-45`) |
| Product page shows the Japanese name | Not shown (`products/[slug]/page.tsx:58-63`) |
| Prices always show two decimals: `$38.00` | Whole dollars drop the decimals (`format.ts:6`) |
| Tailwind default text sizes only | `text-[11px]` (`purchase-panel.tsx:46`), `tracking-[0.2em]` (`shop-view.tsx:47`, `purchase-panel.tsx:19`) |
| Phosphor icons, Noto Sans JP | Neither is installed or loaded (`package.json:11-17`, `layout.tsx:7-18`) |
| Product photos follow the art direction (`CLAUDE.md:19`) | The old Unsplash set stays for now. The user picks the image source later |

### 1.2 Open items
- Phosphor icon names. The build session picks one icon per meaning and uses it everywhere.

## 2. Foundations

### 2.1 Color

| Token | Hex | Defined | Use |
| --- | --- | --- | --- |
| ink | `#0a0a0a` | `globals.css:7` | Page background (`globals.css:31`). Text on vermilion fills. |
| surface | `#141414` | `globals.css:8` | Cards, cart drawer, order summary, notices. |
| raised | `#1c1c1c` | `globals.css:9` | Input fill, hover fill. |
| line | `#3a3a3a` | `globals.css:10` | Dividers and decorative box edges. Never a control edge. |
| bone | `#f2ede4` | `globals.css:11` | Text. Hover fill of the primary button (`page.tsx:62`). |
| muted | `#a8a39a` | `globals.css:12` | Secondary text. Default border of a control. |
| vermilion | `#f04e37` | `globals.css:13` | The one accent: fills, links, errors, focus ring. |

Measured WCAG contrast:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| bone on ink, surface, raised | 16.98, 15.80, 14.62 | Pass |
| muted on ink, surface, raised | 7.89, 7.34, 6.79 | Pass |
| vermilion on ink, surface, raised | 5.52, 5.13, 4.75 | Pass as text and as graphic |
| ink on vermilion | 5.52 | Pass |
| ink on bone | 16.98 | Pass |
| bone on vermilion | 3.08 | Fail. Never use. |
| line on ink, surface | 1.74, 1.62 | Dividers only |

Rules:

- A vermilion fill carries ink text. Never bone text.
- A control border is `muted` by default, or `bone` for the secondary button. Both pass the 3:1 non-text rule (`CLAUDE.md:18`). Never `line`.
- `line` draws dividers, table rules and the edge of non-interactive boxes (inline messages, notices). It never draws the edge of a control.
- An error uses vermilion, an icon and text. Never color alone.
- A selected chip or tab changes color (bone fill, ink text), not weight (`purchase-panel.tsx:40`).
- Text selection is vermilion with ink text (`globals.css:43-46`).
- The store has no success or warning color. A success message uses bone text and an icon.
- Photos get no vermilion tint.
- Running text may use `text-bone/90` (about 13.7 on ink). Do not go lower.

### 2.2 Type

| Role | Font | Rule | Source |
| --- | --- | --- | --- |
| Display | Anton 400 | `display` utility: uppercase, 0.02em tracking, line height 1. Fallback: Impact, Arial Narrow Bold. | `globals.css:17`, `64-70`; `layout.tsx:7-12` |
| Body | Inter | Default body font. | `globals.css:18`, `33`; `layout.tsx:14-18` |
| Japanese name | Noto Sans JP 500 | For `name_ja` only. Set `lang="ja"`. Fallback: Hiragino Sans, Yu Gothic. | `CLAUDE.md:42` |
| Eyebrow | Inter 600 | `eyebrow` utility: 12px, uppercase, 0.2em tracking, vermilion. | `globals.css:72-79` |
| Group label | Inter 600 | Legend of a filter group or the size picker: same shape as the eyebrow, in muted. Form field labels are different (section 4, Form field). | `shop-view.tsx:47` |

- Load Noto Sans JP with the Google Fonts `text=` parameter. The text is the glyphs of all `name_ja` values and nothing else: `狐鬼狸河童天狗鵺幽霊絡新婦木霊獏化け猫傘おば`. The Lantern hero (section 6.5) uses the same glyphs. `next/font/google` has no `text` option (options: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md:98-236`). Use a `<link>` element.
- Sizes: Tailwind default text sizes only. No arbitrary sizes.
  - Page title: `display text-5xl sm:text-7xl` (`shop-view.tsx:71`).
  - Section title: `display text-4xl sm:text-5xl` (`page.tsx:80`).
  - Sub-heading: `display text-3xl` (`shipping/page.tsx:16`).
  - Hero: `display text-6xl sm:text-8xl lg:text-9xl` (`page.tsx:43`).
  - Body `text-base`. Small `text-sm`. Labels `text-xs`.
  - Button label: `display text-lg` (`page.tsx:62`).
- Running text is at most about 65ch wide. Use `max-w-prose` (`about/page.tsx:19`, `products/[slug]/page.tsx:63`).

### 2.3 Layout

- `wrap` utility: max width 80rem, centered. Gutter 16px, 24px from `sm` (640), 32px from `lg` (1024) (`globals.css:48-61`).
- Breakpoints: Tailwind default. Test every page at 375, 768, 1280 and 1440 px.
- Spacing: Tailwind default 4px scale.
- Product grid: 2 columns, 3 from `md`, 4 from `lg`. Gap `gap-x-4 gap-y-10` (`shop-view.tsx:122`).
- Touch targets: at least 44px (`min-h-11`) for links and chips (`shop-view.tsx:27`). Buttons use `min-h-12` (`page.tsx:62`) or `min-h-14` (`purchase-panel.tsx:59`).
- The header is sticky, 64px high (`site-header.tsx:15-16`). Set `scroll-padding-top` to the header height on `html`, so the header never covers a focused element (WCAG 2.4.11).

### 2.4 Shape

- The store has no rounded corners. No `rounded` class exists in `src/` today. Keep it that way.
- The admin keeps the shadcn default radius.

### 2.5 Motion

| Use | Spec | Source |
| --- | --- | --- |
| Color change on hover | Tailwind default `transition-colors` (150ms) | `page.tsx:62` |
| Image hover | Scale 1.05, 500ms | `page.tsx:123`, `product-card.tsx:24` |
| `animate-rise` | 0.7s. Only on the mobile menu. | `globals.css:93-95`; `site-nav.tsx:65` |
| Lantern light | Pointer lag 120ms, idle drift after 3s at 70px/s. Section 6.5. | Not built yet |
| Cart drawer | Slides in from the right, 250ms, `cubic-bezier(0.2, 0, 0, 1)`. Closes faster (200ms). | Not built yet |

- Motion stays within the table above. Drawer, hover and menu motion is functional. The Lantern hero (section 6.5) is the only designed moment.
- No parallax. No scroll reveals.
- Under `prefers-reduced-motion: reduce`, animation and transition durations drop to 0.001ms and smooth scroll turns off (`globals.css:97-109`).

### 2.6 Focus

- Every interactive element gets `:focus-visible`: a 2px vermilion outline with a 3px offset (`globals.css:38-41`).
- The ring passes because the outline sits outside the control, on the surface behind it: 5.52 on ink, 5.13 on surface, 4.75 on raised. This holds on a vermilion button too.
- A hidden radio draws the ring on its label (`purchase-panel.tsx:40`).
- The skip link shows on focus (`layout.tsx:33-38`).

### 2.7 Icons

- The store uses Phosphor (`@phosphor-icons/react`). In Server Components, import from `@phosphor-icons/react/ssr` (`CLAUDE.md:17`).
- Regular weight only. Size 20px or 24px. A selected state changes color, not weight.
- A decorative icon has `aria-hidden="true"`. An icon-only button has an accessible name.
- The admin keeps Lucide inside stock shadcn components (`CLAUDE.md:43`).

### 2.8 Admin theme

- shadcn/ui, dark theme, neutral base.
- `--primary` is `#f04e37`. `--primary-foreground` is `#0a0a0a`.
- Default shadcn radius. Lucide icons. Sonner toasts (`CLAUDE.md:62`).
- The admin does not use the store components in section 4.
- Order status badges use stock shadcn badge variants. Suggested map: pending `secondary`, shipped `default`, cancelled `destructive`.

## 3. Brand

### 3.1 Logo

- Picked: sketch A, "Charm" (user decision, 2026-11-19). A blank geometric mask with one vermilion paper charm on the brow. Not a named yokai.
- Colors: bone `#f2ede4` face, vermilion `#f04e37` charm. Flat fills. It reads at 16px.
- **Mark** (`mark.svg`, viewBox 0 0 64 64, transparent background). Use it on ink or surface only. It is not for light backgrounds.
- **Favicon** (`icon.svg`): the mark on a full ink square, radius 0, so it stays visible in a light browser tab bar. Delete `src/app/favicon.ico`, or browsers keep showing the old mask.
- **Wordmark**: live text "YOKAI APPAREL" in the `display` utility (Anton). It is not an image, because an SVG image cannot load the web font.
- **Lockup** (header): the mark at 32px (`h-8 w-8`), a 12px gap (`gap-3`), then the wordmark at `text-xl`. The link around it keeps `aria-label="Yokai Apparel, home"` (`site-header.tsx:19`). The mark and the text inside are `aria-hidden`. Estimated width at 375px: about 170px. The build session measures it in the mobile header (Menu, lockup, cart).
- Clear space around the mark: at least a quarter of its size. Never recolor, rotate, outline or put a shadow on it.

### 3.2 Japanese names

- Field: `name_ja`.
- Show it under the English name, on the product card and the product page. Small and muted. Noto Sans JP 500.
- Every value needs a cited folklore source (`CLAUDE.md:15`). The 12 values and their sources went to the build session on 2026-11-19. Never invent a value.

### 3.3 Imagery

- Two images per product: front, plus back or detail.
- Aspect 4:5 (`product-card.tsx:16`, `gallery.tsx:21`). Garment centered on a dark seamless background. Same light in every shot.
- Lifestyle photos (Home, About) are black and white. No vermilion tint on any photo.
- Licensed photos come first. If none fits, use an AI-generated image in the same direction and mark it "AI-generated" on the Credits page (`CLAUDE.md:19`).
- Product images in the grid are decorative (`alt=""`, `product-card.tsx:20`). The gallery image carries real alt text (`catalog.ts:22-28`).

### 3.4 Voice

- Plain, short, dry.
- No fake Japanese. No "mystic" filler.
- The folklore facts go into the product description. There is no separate folklore note block.
- Prices always show cents: "$38.00".

## 4. Components

The store builds these components and no others. Each entry gives the key rules.

### Header
- Sticky, 64px, `border-b border-line`, `bg-ink/95` with blur (`site-header.tsx:15-16`).
- Desktop: logo left, links center (Shop, Tees, Hoodies, Accessories, About), cart with item count right. Mobile: Menu button, logo, cart.
- Links: `text-sm font-semibold uppercase tracking-widest`. The current page is vermilion and has `aria-current="page"` (`site-nav.tsx:28-31`, `36`, `41`).
- The cart is a button with a Phosphor cart icon and the count. Its name reads "Cart, 2 items". It opens the cart drawer.

### Mobile menu
- A disclosure, not a dialog. No focus trap. The Menu button has `aria-expanded` and `aria-controls` (`site-nav.tsx:52-60`).
- The panel sits under the header. Links use `display text-3xl`, `min-h-12` (`site-nav.tsx:61-80`). It uses `animate-rise` (`site-nav.tsx:65`).
- Escape closes it and returns focus to the Menu button. Choosing a link closes it (`site-nav.tsx:72`).
- The Menu button has a muted border (`border-muted`), `min-h-11`.

### Footer
- Keep the wordmark and tagline block (`site-footer.tsx:14-20`).
- Links in order: About, Shipping & Returns, Image credits. No "Shop all". Then the demo-store line (`site-footer.tsx:3-8`, `36-40`).
- `border-t border-line`. Links are `text-sm`, `min-h-11`, hover vermilion (`site-footer.tsx:27`).

### Demo notices
- Footer line: "Demo store. No real orders or payments." in `text-sm text-muted` (`site-footer.tsx:37-39`).
- Payment banner: "Demo store: no real payment is taken". It sits at the top of the Payment step, always visible, not dismissible. It uses the info Inline message.

### Button
- Primary: `bg-vermilion text-ink`, hover `bg-bone` (`page.tsx:62`). Secondary: `border border-bone text-bone`, hover `border-vermilion text-vermilion` (`page.tsx:68`).
- Both use `display text-lg`, `min-h-12`, `px-8`, radius 0. A full-width button uses `min-h-14 text-xl` (`purchase-panel.tsx:59`).
- Text link: bone, underlined, offset 4px, hover vermilion (`purchase-panel.tsx:66`).
- Busy: the label changes ("Adding...", "Processing..."). The button is `disabled` and dims to `opacity-70`.

### Product card
- One link wraps the card (`product-card.tsx:15`). One 4:5 image (`product-card.tsx:16`). No hover image swap.
- Under the image: English name (`display text-lg`, hover vermilion) with the price on the right (`text-sm font-semibold`, bone). Then the Japanese name, small and muted.
- Image hover: scale 1.05 over 500ms (`product-card.tsx:24`).
- All sizes sold out: the "Sold out" badge shows on the image (`product-card.tsx:27-31`). The card stays a link.

### Product grid
- A `<ul>` of cards. 2 columns, 3 from `md`, 4 from `lg` (`shop-view.tsx:122`). Gap `gap-x-4 gap-y-10`.
- The Home featured row uses 2 columns, 4 from `lg` (`page.tsx:91`).

### Filter bar
- Three groups: category, size, sort. Each group has a label in the field-label style (`shop-view.tsx:38-53`).
- Category: links, one per category page, so each filter result has its own address. The current one has `aria-current="page"`.
- Size: a native radio group, drawn as chips like the size picker. Sort: a native `<select>`. State stays in the URL (`catalog.ts:90-100`).
- Chips and the select have `min-h-11` and a muted border. A selected chip has a bone fill and ink text.
- The bar sits between two `border-line` rules (`shop-view.tsx:75`). The result count below uses `role="status"` (`shop-view.tsx:116-119`).

### Size picker
- A `<fieldset>` with a `<legend>`. A native radio group. The radio is visually hidden. The label is the chip (`purchase-panel.tsx:18-40`).
- Chip: `min-h-14 min-w-16`, muted border, hover bone border. Selected: bone fill, ink text.
- A sold-out size is `disabled`, has a dashed border, a struck label and the text "Sold out" (`purchase-panel.tsx:40-49`). Arrow keys skip it.
- A one-size product is preselected (`purchase-panel.tsx:9-14`). With no size picked, Add to cart shows an error under the picker and moves focus to the first available size.

### Quantity stepper
- A minus button, the number, a plus button. Buttons are 44px square, muted border, Phosphor icons at 20px. Each button has a name, for example "Decrease quantity of Kitsune Tee".
- Minimum 1. At 1 the minus button is disabled. Remove is a separate action. Maximum is the stock of that size. At the maximum the plus button is disabled.

### Cart drawer and cart line item
- Radix Dialog with focus trap. Slides in from the right (section 2.5). `bg-surface`, `border-l border-line`, radius 0. Full width on phones, `max-w-md` from `sm`.
- "Add to cart" opens it and shows the added item. The title "Cart" uses `display`. A close button with an icon and a name sits at the top right. Escape closes it.
- Line item: small 4:5 image, English name, size, unit price, quantity stepper, a "Remove" text link, line total.
- Footer: subtotal, one muted line "$X.XX away from free shipping" (free at $100.00 or more; at or above it the line reads "Free shipping"), a full-width primary "Checkout" button. An empty cart shows the Empty state.

### Form field
- Label above the field (`text-sm font-semibold`). Input `min-h-12`, `bg-raised`, muted border, bone text, radius 0. Hover: bone border.
- Help text sits under the input in `text-sm text-muted`. The error sits under the help text.
- Check on blur. An invalid field gets a vermilion border, `aria-invalid="true"` and `aria-describedby` for the help and error ids. After the first error, check again on each change.
- Error = Phosphor warning icon (20px) + text, both vermilion, `text-sm`. No summary box. On submit, focus moves to the first invalid field.
- Use the right `type` and `autocomplete` value on every shipping field: `name`, `email` (`type="email"`), `address-line1`, `address-line2`, `address-level2` (city), `postal-code` (`inputmode="numeric"`).

### Card payment form
- Fields: card number, name on card, expiry, CVC. Card number, expiry and CVC use `inputmode="numeric"`.
- All card fields use `autocomplete="off"`. Reason: this is a demo store, and `cc-*` values make the browser offer the user's real saved cards. This is a deliberate exception to WCAG 1.3.5 (user decision, 2026-11-19). Swap to `cc-*` values if Stripe replaces the stub.
- The card number is prefilled with the test card 4242 4242 4242 4242 (`CLAUDE.md:34`). The browser checks the format only. Card data never leaves the browser.
- The pay button reads "Pay $X.XX". While busy it reads "Processing..." and is disabled for about 1.5s. Then the confirmation page opens.

### Order summary
- Rows: line items, Subtotal, Shipping ($6.00, or "Free" at $100.00 or more), "Estimated tax (7.25%)", Total. Total uses `display text-2xl`.
- Desktop: a `surface` panel, sticky in the right column. Mobile: collapsed at the top, shows the total, opens as a disclosure.

### Checkout step indicator
- An ordered list with two steps: 1 Shipping, 2 Payment. The current step has `aria-current="step"`, bone text and a vermilion bar.
- A locked Payment step is muted and shows a lock icon plus the word "Locked". A finished step shows a check icon.

### Inline message
- Three kinds: error, success, info. Each has an icon (20px) and text. The icon and text carry the kind, not color alone.
- Error: vermilion text and icon, vermilion border. Success and info: bone text, `border-line`. Box: `bg-surface`, `p-4`, radius 0.
- Errors that appear after a submit use `role="alert"`.

### Empty state
- A bordered block: `display text-3xl` heading, one muted line (`max-w-md`), one primary button (`shop-view.tsx:130-141`).
- Used for an empty cart and for a shop filter with no results.

### Prose block
- Max width `max-w-prose` (65ch). Text `text-bone/90`. `space-y-6` between paragraphs (`about/page.tsx:19`).
- Sub-headings use `display text-3xl`. Links are bone, underlined, hover vermilion (`credits/page.tsx:54`).
- Used on About, Shipping & Returns and Image credits.

### Badges
- Store: one badge, "Sold out". `bg-ink`, bone text, `text-xs font-semibold uppercase tracking-widest`, top-left of the image (`product-card.tsx:27-31`).
- Admin: order status only, with shadcn badge variants.

## 5. UX flows

### 5.1 Browse to confirmation

1. **Browse.** Home hero links to Shop. The header links to Shop, each category and About. Shop filters by category and size and sorts by newest, price up, price down (`catalog.ts:9-13`). The result count updates.
2. **Product.** Two columns from `lg` (`products/[slug]/page.tsx:55`): gallery left, details right. Details: name, Japanese name, price, description (which carries the folklore facts), size picker, Add to cart.
3. **Add to cart.** No size: error under the picker, focus on the first available size. Size picked: the button reads "Adding..." and is disabled, then the cart drawer opens with the added item.
4. **Cart drawer.** Change the quantity, remove a line, read the subtotal and the free-shipping line. "Checkout" goes to the checkout page. Close returns to the page.
5. **Checkout, Shipping.** One page, two steps. Fields follow the Form field rules. The primary button reads "Continue to payment". If a field is invalid, focus moves to the first bad field.
6. **Checkout, Payment.** Payment unlocks when Shipping is valid. Shipping collapses to a summary with an "Edit" link. Focus moves to the Payment heading. "Edit" reopens Shipping and locks Payment until Shipping is valid again.
7. **Pay.** The demo banner shows. The button reads "Processing..." for about 1.5s. The server checks stock again and saves the order as paid (demo) (`CLAUDE.md:34-35`). A stock failure shows an error Inline message above the pay button. No toast.
8. **Confirmation.** A success Inline message, the order summary, the shipping address and a "Continue shopping" link. The cart is empty.

Layout of the order summary: sticky right column on desktop, collapsed total at the top on mobile (`CLAUDE.md:60`).

### 5.2 Admin: login to order status

This section is the flow only. Layouts, copy and rules for every admin page are in section 7.

1. Login page. It shows the demo email and password (`CLAUDE.md:37`). "Use demo login" fills both fields. An admin address with no session opens Login first, then the page that was asked for.
2. Products: the list, then a form page to create or edit. Delete sits on the edit page, behind a confirm dialog. Uploads are JPG, PNG or WebP, 2 MB at most (`CLAUDE.md:37`). A Sonner toast confirms each save and each delete.
3. Orders: list, then detail. Change the status to pending, shipped or cancelled. The status is a label only. A Sonner toast confirms the change.
4. A server failure shows a Sonner error toast. A field error never uses a toast.
5. Sign out returns to Login.

All admin screens use stock shadcn components.

## 6. Page layouts

Scope: the Phase 2 pages, Checkout and Order confirmation. Sections 6.1, 6.3 and 6.4 apply sections 2 to 5. Section 6.2 is the shipping field list (approved by the user, 2026-11-20). Wireframes are not to scale. The wireframe legend: `[ ]` field or button, `(i)` info icon, `(!)` error icon, `(ok)` check icon, `[lock]` lock icon, `v` caret, `[img]` product photo.

### 6.1 Checkout

One page, two steps (section 5.1, steps 5 to 7). Page title in the browser tab: "Checkout". The site template adds the site name (`layout.tsx:21-24`). The page uses the `wrap` utility and the same top padding as the other pages (`pt-12 md:pt-16`, `shipping/page.tsx:10`).

**Mobile, 375px.** Left: Shipping open, Payment locked. Right: Shipping done, Payment open. The `(!)` lines show only after a stock failure.

```
+---------------------------------+  +---------------------------------+
| [Menu]  YOKAI APPAREL  [Cart 2] |  | [Menu]  YOKAI APPAREL  [Cart 2] |
|---------------------------------|  |---------------------------------|
| CHECKOUT                        |  | CHECKOUT                        |
|                                 |  |                                 |
| [ Order summary  v     $89.66 ] |  | [ Order summary  v     $89.66 ] |
|                                 |  |                                 |
| 1 Shipping        2 Payment     |  | [ok] 1 Shipping   2 Payment     |
| ================  ----------    |  | ================  ==========    |
|                   [lock] Locked |  |                                 |
|                                 |  | SHIPPING                 [Edit] |
| SHIPPING                        |  | Ana Ruiz                        |
| We ship to California only.     |  | 123 Example St                  |
| Email                           |  | Unit 4                          |
| [                             ] |  | Oakland, CA 94607               |
| Full name                       |  | ana@example.com                 |
| [                             ] |  |---------------------------------|
| Street address                  |  | PAYMENT                         |
| [                             ] |  | (i) Demo store: no real         |
| Apt, suite, unit (optional)     |  |     payment is taken            |
| [                             ] |  | Card number                     |
| City                            |  | [4242 4242 4242 4242          ] |
| [                             ] |  | Name on card                    |
| State          ZIP code         |  | [                             ] |
| California     [              ] |  | Expiry date      CVC            |
|                                 |  | [             ]  [            ] |
| [ CONTINUE TO PAYMENT         ] |  | (!) Kitsune Tee in size M is    |
|---------------------------------|  |     sold out. We removed it     |
| PAYMENT                         |  |     from your cart. Check your  |
| [lock] Locked                   |  |     order, then pay again.      |
|                                 |  | [ PAY $89.66                  ] |
+---------------------------------+  +---------------------------------+
```

**Desktop, 1280px, Shipping open.** The summary is a sticky panel in the right column.

```
+----------------------------------------------------------------------+
| YOKAI APPAREL    Shop  Tees  Hoodies  Accessories  About    [Cart 2] |
|----------------------------------------------------------------------|
| CHECKOUT                                                             |
|                                                                      |
| 1 Shipping           2 Payment       +-----------------------------+ |
| ===================  -----------     | ORDER SUMMARY               | |
|                      [lock] Locked   | [img] KITSUNE TEE    $38.00 | |
|                                      |       Size M, qty 1         | |
| -----------------------------------  | [img] BAKU TOTE      $40.00 | |
| SHIPPING                             |       One Size, qty 1       | |
| We ship to California only.          |-----------------------------| |
| Email                                | Subtotal             $78.00 | |
| [                                 ]  | Shipping              $6.00 | |
| Full name                            | Estimated tax (7.25%) $5.66 | |
| [                                 ]  |-----------------------------| |
| Street address                       | TOTAL                $89.66 | |
| [                                 ]  +-----------------------------+ |
| Apt, suite, unit (optional)                                          |
| [                                 ]  (sticky)                        |
| City        State       ZIP code                                     |
| [        ]  California  [         ]                                  |
|                                                                      |
| [ CONTINUE TO PAYMENT             ]                                  |
| -----------------------------------                                  |
| PAYMENT                                                              |
| [lock] Locked                                                        |
+----------------------------------------------------------------------+
```

**Desktop, 1280px, Payment open.** Shipping is collapsed. The `(!)` lines show only after a stock failure.

```
+----------------------------------------------------------------------+
| YOKAI APPAREL    Shop  Tees  Hoodies  Accessories  About    [Cart 2] |
|----------------------------------------------------------------------|
| CHECKOUT                                                             |
|                                                                      |
| [ok] 1 Shipping      2 Payment       +-----------------------------+ |
| ===================  ===========     | ORDER SUMMARY               | |
|                                      | [img] KITSUNE TEE    $38.00 | |
| -----------------------------------  |       Size M, qty 1         | |
| SHIPPING                     [Edit]  | [img] BAKU TOTE      $40.00 | |
| Ana Ruiz                             |       One Size, qty 1       | |
| 123 Example St                       |-----------------------------| |
| Unit 4                               | Subtotal             $78.00 | |
| Oakland, CA 94607                    | Shipping              $6.00 | |
| ana@example.com                      | Estimated tax (7.25%) $5.66 | |
| -----------------------------------  |-----------------------------| |
| PAYMENT                              | TOTAL                $89.66 | |
| (i) Demo store: no real payment      +-----------------------------+ |
|     is taken                                                         |
| Card number                          (sticky)                        |
| [4242 4242 4242 4242              ]                                  |
| Name on card                                                         |
| [                                 ]                                  |
| Expiry date        CVC                                               |
| [               ]  [              ]                                  |
| (!) Kitsune Tee in size M is sold                                    |
|     out. We removed it from your                                     |
|     cart. Check your order, then                                     |
|     pay again.                                                       |
| [ PAY $89.66                      ]                                  |
+----------------------------------------------------------------------+
```

**Grid.** Below `lg` (1024px): one column, `gap-8`. From `lg`: `grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-x-12 items-start`.

| Viewport | Content width | Form column | Summary column |
| --- | --- | --- | --- |
| 1024 | 960px | 532px | 380px |
| 1280 and 1440 | 1216px | 681px | 487px |

Why `lg`: the split needs a form column of about 500px or more and a summary of about 380px or more.

- At `md` (768px) the content is 720px. A split gives 392px and 280px. The summary is too narrow for a 56px photo, a product name and a price. In the City, State and ZIP row, City gets only 120px.
- At `lg` both columns are wide enough. Section 2.3 uses `lg` for the product grid too.

Regions, top to bottom on mobile. The desktop position is in each item.

1. **Page title.** `h1` "Checkout". Use `display text-5xl sm:text-7xl` (section 2.2). No eyebrow. Space below: `mt-8`.
2. **Order summary.** Component: Order summary. It is the first child of the grid, so on mobile it sits above the steps.
   - Mobile: a full-width button bar, `min-h-14`, `bg-surface`, muted border. Left: "Order summary" and a caret icon. Right: the total in `display text-2xl`. The button has `aria-expanded` and `aria-controls`. It starts closed. When open, the panel pushes the page down. It is not a dialog. It has no focus trap.
   - Open panel on mobile: the lines, Subtotal, Shipping and "Estimated tax (7.25%)". The panel does not repeat the Total. The bar keeps it.
   - Desktop: the button is hidden. The panel is always open, in the right column, `bg-surface border border-line p-6`, `lg:sticky lg:top-24` (64px header plus 32px). It has an `h2` "Order summary" (`display text-3xl`). It is sticky only when the cart has 3 lines or fewer. With 4 or more lines it scrolls with the page, so it is never taller than the screen while it is stuck.
   - Line: 56px wide 4:5 photo (`alt=""`), English name (`display text-lg`), "Size M, qty 1" (`text-sm text-muted`), line total on the right (`text-sm font-semibold`). A one-size product reads "One Size, qty 1".
   - Rows under the lines, with a `border-t border-line`: "Subtotal", "Shipping" ($6.00, or "Free" at $100.00 or more), "Estimated tax (7.25%)", "Total" (`display text-2xl`).
   - The panel has no link or button, so it adds no tab stop on desktop. The cart drawer is the only place to change the cart.
   - Money rules: tax is 7.25% of the subtotal. Shipping has no tax. Round the tax to whole cents, half up: `tax_cents = floor((subtotal_cents * 725 + 5000) / 10000)`. The server computes every amount. The browser shows the same numbers.
3. **Step indicator.** Component: Checkout step indicator. It is the first item in the main column, above the steps. Two equal items.
   - Current: `aria-current="step"`, bone text, vermilion bar (4px, top edge).
   - Finished: check icon with hidden text "Done", bone text, bone bar.
   - Locked: muted text, lock icon, the word "Locked", `line` bar.
   - Text style: `text-sm font-semibold uppercase tracking-widest` (the header link style).
4. **Shipping step, open.** `h2` "Shipping" (`display text-3xl`, `tabindex="-1"`). Under it: "We ship to California only. Free shipping on orders of $100 or more." Then the form from section 6.2. The form has `noValidate`. Fields follow the Form field rules (section 4).
   - Button: Primary, "Continue to payment". Full width below `sm`, then auto width (`min-h-12 px-8`).
   - Invalid form: focus moves to the first invalid field. No summary box.
   - Valid form: go to region 5 and region 7. Focus moves to the Payment heading.
5. **Shipping step, done.** The same section, collapsed. One row: `h2` "Shipping" on the left, "Edit" on the right. "Edit" is a `<button>` drawn as the Text link, `min-h-11`, `aria-label="Edit shipping details"`. Under the row, plain text lines in an `<address>` element (not italic): full name, address line 1, address line 2 (if any), "City, CA ZIP", email.
   - The shipping fields unmount, so they have no tab stop. Their values stay in the checkout form state.
   - "Edit": the form opens again with the saved values. Region 6 locks and its fields unmount. The card values also stay in the form state and come back when Payment opens again. Focus moves to the Shipping heading.
6. **Payment step, locked.** `h2` "Payment" in muted. Under it: lock icon, "Locked", and the muted line "Finish shipping to unlock payment." No fields are in the page.
7. **Payment step, open.** `h2` "Payment" (`tabindex="-1"`). Below it, in this order:
   1. **Demo banner.** Inline message, info kind: "Demo store: no real payment is taken". It is always visible. It has no close button.
   2. **Card form.** Component: Card payment form. Fields in the table below. The card number is prefilled with `4242 4242 4242 4242`. Name on card is full width. Expiry date and CVC share one row at every width (`grid-cols-2 gap-4`).
   3. **Stock error.** Inline message, error kind, `role="alert"`, `tabindex="-1"`. It sits directly above the pay button. It is hidden until a stock failure. The text is in section 6.4. When it shows, focus moves to it.
   4. **Pay button.** Primary, full width (`min-h-14 text-xl`). Label: "Pay $89.66" (the current total). Busy: "Processing...", `disabled`, `opacity-70`, about 1.5s. Then the confirmation page opens.

| Label | Type, inputmode | Autocomplete | Rule | Error text | Help text |
| --- | --- | --- | --- | --- | --- |
| Card number | `text`, `numeric` | `off` | 13 to 19 digits. Spaces allowed. | "Enter a card number with 13 to 19 digits." | "Demo test card. Any future expiry date and any 3-digit CVC work." |
| Name on card | `text` | `off` | Not empty. | "Enter the name on the card." | None |
| Expiry date | `text`, `numeric` | `off` | MM / YY. Month 01 to 12. Not in the past. | "Enter a date that has not passed, like 08 / 28." | "Month and year, like 08 / 28." |
| CVC | `text`, `numeric` | `off` | 3 or 4 digits. | "Enter the 3 or 4 digit code on your card." | None |

All card fields use `autocomplete="off"` (section 4, Card payment form).

### 6.2 Shipping field list

Status: **Approved by the user, 2026-11-20.** California only and guest checkout (`CLAUDE.md:9`, `31`).

| # | Label | Type | Autocomplete | Inputmode | Required | Error text | Help text |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Email | `email` | `email` | `email` | Yes | "Enter an email address like name@example.com." | "Used for this order only. No email is sent in this demo." |
| 2 | Full name | `text` | `name` | None | Yes | "Enter your full name." | None |
| 3 | Street address | `text` | `address-line1` | None | Yes | "Enter your street address." | None |
| 4 | Apartment, suite or unit (optional) | `text` | `address-line2` | None | No | None | None |
| 5 | City | `text` | `address-level2` | None | Yes | "Enter your city." | None |
| 6 | State | Static text: "California" | None | None | Not a field | None | None |
| 7 | ZIP code | `text` | `postal-code` | `numeric` | Yes | "Enter a 5-digit ZIP code, like 94103." | None |

Rules:

- **Required mark.** Required fields have no mark. The one optional field says "(optional)" in its label. Set `required` on the others. Trim spaces before each check.
- **Email.** Guest checkout has no account, so the email is the only contact. The check is a format check: text, `@`, text, `.`, text.
- **Name.** One field, not first and last. It fills in from `autocomplete="name"`.
- **State.** The store ships to California only. State is plain text, not a field: label "State" (field label style), value "California" (`text-base`, `min-h-12`, no border, no fill, no tab stop). It is announced twice: the sentence under the Shipping heading, and this line before ZIP. The server saves the state as `CA`. No state field exists, so no `address-level1` value is used.
- **ZIP.** Check the format only: exactly 5 digits. No California range check. A range check needs a list to maintain, and the demo ships nothing. A visitor can enter a ZIP outside California. The server saves it as entered.
- **Phone: not included.** Nothing calls or texts the buyer in this demo. Order emails are out of scope (`CLAUDE.md:38`). Each extra field slows the form and adds personal data to a public demo. If a later phase needs it: add "Phone (optional)", `type="tel"`, `autocomplete="tel"`, `inputmode="tel"`, error "Enter a 10-digit US phone number, like 415 555 0100."
- **Order.** Contact first (Email, Full name), then the address in postal order (Street address, Apartment, City, State, ZIP).
- **Rows.** Email, Full name, Street address and Apartment each use a full row at every width. City, State and ZIP share one row from `sm`: `grid-cols-[minmax(0,1fr)_7rem_8rem] gap-4`. Below `sm`: City on its own row, then State and ZIP side by side (`grid-cols-2 gap-4`).

### 6.3 Order confirmation

The page opens after payment. Page title in the browser tab: "Order placed". Document order is the order of the regions below. The cart is empty on this page.

On load, focus moves to the `h1`. Reason: the page opens by navigation. A keyboard or screen reader user starts at the page title, not at the header.

**Mobile, 375px.**

```
+---------------------------------+
| [Menu]  YOKAI APPAREL    [Cart] |
|---------------------------------|
| ORDER PLACED                    |
|                                 |
| (ok) Your order number is       |
|      YK-10482.                  |
|                                 |
| WHAT HAPPENS NEXT               |
| This is a demo store. No        |
| payment was taken, and          |
| nothing will ship.              |
| No confirmation email is sent.  |
| Order emails are not part of    |
| this demo.                      |
|                                 |
| +-----------------------------+ |
| | ORDER SUMMARY               | |
| | [img] KITSUNE TEE    $38.00 | |
| |       Size M, qty 1         | |
| | [img] BAKU TOTE      $40.00 | |
| |       One Size, qty 1       | |
| |-----------------------------| |
| | Subtotal             $78.00 | |
| | Shipping              $6.00 | |
| | Estimated tax (7.25%) $5.66 | |
| |-----------------------------| |
| | TOTAL                $89.66 | |
| +-----------------------------+ |
|                                 |
| SHIPPING ADDRESS                |
| Ana Ruiz                        |
| 123 Example St                  |
| Unit 4                          |
| Oakland, CA 94607               |
|                                 |
| Continue shopping               |
|                                 |
+---------------------------------+
```

**Desktop, 1280px.**

```
+----------------------------------------------------------------------+
| YOKAI APPAREL    Shop  Tees  Hoodies  Accessories  About      [Cart] |
|----------------------------------------------------------------------|
| ORDER PLACED                                                         |
|                                                                      |
| (ok) Your order number is YK-10482.  +-----------------------------+ |
|                                      | ORDER SUMMARY               | |
| WHAT HAPPENS NEXT                    | [img] KITSUNE TEE    $38.00 | |
| This is a demo store. No payment     |       Size M, qty 1         | |
| was taken, and nothing will ship.    | [img] BAKU TOTE      $40.00 | |
| No confirmation email is sent.       |       One Size, qty 1       | |
| Order emails are not part of this    |-----------------------------| |
| demo.                                | Subtotal             $78.00 | |
|                                      | Shipping              $6.00 | |
| SHIPPING ADDRESS                     | Estimated tax (7.25%) $5.66 | |
| Ana Ruiz                             |-----------------------------| |
| 123 Example St                       | TOTAL                $89.66 | |
| Unit 4                               +-----------------------------+ |
| Oakland, CA 94607                                                    |
|                                                                      |
| Continue shopping                                                    |
+----------------------------------------------------------------------+
```

Grid: the same as Checkout. Below `lg`: one column. From `lg`: `grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-x-12`. Place the summary in the right column with grid areas. This keeps the DOM order the same as the mobile order. The summary is not sticky.

Regions:

1. **Page title.** `h1` "Order placed". `display text-5xl sm:text-7xl`. It has `tabindex="-1"` and takes focus on load.
2. **Success message.** Inline message, success kind: check icon, bone text, `border-line`. Text: "Your order number is YK-10482." The number is `font-semibold`. Order number format: "YK-" and 5 digits. The message has no `role="alert"`: the focus move already announces the page.
3. **What happens next.** `h2` "What happens next" (`display text-3xl`). Two paragraphs in a Prose block (`max-w-prose`):
   - "This is a demo store. No payment was taken, and nothing will ship."
   - "No confirmation email is sent. Order emails are not part of this demo."
4. **Order summary.** The same panel as Checkout, but static: `h2` "Order summary", no toggle button, no sticky position. The Total row shows at every width. The amounts come from the saved order, not from the cart.
5. **Shipping address.** `h2` "Shipping address" (`display text-3xl`). An `<address>` element (not italic): full name, address line 1, address line 2 (if any), "City, CA ZIP". No email. No phone.
6. **Continue shopping.** Text link "Continue shopping" to the shop page. `min-h-11`. It is the last item.

### 6.4 Empty and edge states

- **Checkout with an empty cart.** Show the Empty state on the checkout page. Do not redirect.
  - Why: a redirect drops the visitor on another page with no explanation. The Empty state also covers a bookmark and the Back button after an order, when the cart is empty.
  - Layout: the `h1` "Checkout", then the Empty state. No step indicator. No summary.
  - Copy: heading "Your cart is empty". Line "Add an item, then come back to check out." Button "Browse the shop" (Primary, to the shop page).
  - Load order: read the cart from browser storage first. Until then, render nothing under the title. Show the Empty state only after the read. No skeleton (`CLAUDE.md:62`).
- **Confirmation URL that does not exist.** Call `notFound()`. The page shows the existing not-found page (`not-found.tsx`). It adds no order text, so it does not say whether an order exists. The confirmation URL uses the unguessable order id, not the short order number. The page shows a name and an address. A visitor must not read another order by counting numbers.
- **A size sold out between cart and pay.** The server checks stock when the visitor presses Pay. If a line fails:
  - The order is not saved. The stock does not change.
  - The cart changes. A line with no stock left is removed. A line with less stock than its quantity gets the quantity that is left.
  - The summary, the Pay amount and the Shipping row update. Shipping can change from "Free" to $6.00 when the subtotal drops below $100.00.
  - The Payment step stays open. The card values stay.
  - The error shows above the pay button (region 7.3). Focus moves to it.
  - Sold out: "Kitsune Tee in size M is sold out. We removed it from your cart. Check your order, then pay again."
  - Less stock: "Only 1 Kitsune Tee in size M is left. We changed your quantity to 1. Check your order, then pay again."
  - One Size product: leave out "in size ...". Example: "Baku Tote is sold out. We removed it from your cart. Check your order, then pay again."
  - More than one line fails: write the first two sentences for each line. Then write "Check your order, then pay again." once.
  - The last line fails: the cart is empty. Show the Empty state with the line "The last item in your cart sold out. Add another item to check out."
- **Other server failure.** The same error position and rules. Text: "We could not place your order. Nothing was charged. Try again." The button returns to "Pay $89.66".

### 6.5 Home hero: Lantern

Status: **Approved by the user, 2026-11-20.** Phase 2 brief, last task. Prototype: https://claude.ai/artifact/TT8pXkh2CXRnUUjMJbtgsj. This replaces the earlier hero motion decision (rise-in) and the vertical 妖怪.

The idea: the street photo is dark at rest. A soft light circle moves over it. Inside the circle the photo is brighter and the 12 yokai names show in kanji. The light never reaches the text block.

**Keep (`page.tsx:16-73`).** The section box, the photo, the two gradients, the eyebrow, the headline, the paragraph, both buttons and their links. Same strings, sizes and spacing.

**Remove.**
- The vertical 妖怪 (`page.tsx:33-39`).
- `animate-rise` and the `animationDelay` styles on the eyebrow, headline, paragraph and buttons (`page.tsx:41-58`). The text is static.

**Layers, bottom to top.**

| # | Layer | Rule |
| --- | --- | --- |
| 1 | Photo | `hero-dark-street.webp`, as today. Add `unoptimized` to this `Image`, so the lit layer reuses the same cached file and the photo loads once. Keep `priority`. |
| 2 | Veil | Full cover, `ink` at 86%. The photo is almost black at rest. |
| 3 | Lit photo | The same photo with a 14% `bone` wash on top and two `screen` blend copies under it. Masked to the light circle: solid to 38% of the radius, 55% at 68%, clear at 100%. |
| 4 | Gradients | The two existing gradients (`page.tsx:25-32`), unchanged. |
| 5 | Kanji | The 12 names (table below). Masked to the light circle: solid to 70% of the radius, clear at 100%. |
| 6 | Text block | Unchanged. |

Layers 3 and 5 are `aria-hidden="true"` and `pointer-events: none`. They hold no links and no focusable element.

**Text protection.** The light and the kanji never paint over the text block.
- The `wrap` becomes a one-cell grid (`grid-template-columns: fit-content(100%)`). The text block and two empty boxes (one for layer 3, one for layer 5) share that cell, so each box is exactly the size of the text block at every width.
- Each box has a `clip-path` polygon that keeps only an L shape: the area above the text block (less 1rem) and the area right of it (less 2rem). The layers inside are positioned against the hero, and the clip applies to them too.
- This is CSS only. It works without JS.
- Measured in the prototype: the brightest pixel behind the text is never brighter than today. At 375px the paragraph contrast goes from 4.60 today to 12.61.

**Light.**
- Diameter 160px, 120px below `sm`. Neutral: a `bone` wash only. No vermilion, no flicker.
- Position: two custom properties on the section, `--lx` and `--ly`. Their CSS default is the first kanji (鬼), so the first frame shows a lit name before JS runs.

**Kanji.** Noto Sans JP 500, `writing-mode: vertical-rl`, `bone`, `lang="ja"`. Under each one, the romaji: 10px, Inter 600, uppercase, 0.14em tracking, `muted`. Each kanji has a soft `ink` text shadow. Positions are percentages of the hero, at the center of each name.

| Name | Romaji | Desktop (from `lg`): x, y, size | Below `lg`: x, y, size |
| --- | --- | --- | --- |
| 鬼 | oni | 83%, 17%, 120px | 17%, 12.5%, 80px |
| 河童 | kappa | 93%, 30%, 80px | 40%, 12.5%, 48px |
| 絡新婦 | jorogumo | 93%, 65%, 64px | Hidden |
| 幽霊 | yurei | 83%, 56%, 88px | Hidden |
| 天狗 | tengu | 84%, 85%, 72px | Hidden |
| 木霊 | kodama | 72%, 80%, 60px | Hidden |
| 化け猫 | bakeneko | 72%, 40%, 72px | Hidden |
| 傘おばけ | kasa-obake | 62%, 63%, 56px | Hidden |
| 狐 | kitsune | 62%, 22%, 96px | 61%, 6.5%, 48px |
| 獏 | baku | 40%, 8%, 48px | 61%, 18.5%, 44px (hidden below 360px) |
| 鵺 | nue | 27%, 8.5%, 80px | 84%, 18.5%, 48px (hidden below 360px) |
| 狸 | tanuki | 12%, 9%, 64px | 84%, 6.5%, 44px |

- From 1024px to 1279px, desktop sizes scale by 0.85. Below 360px, phone sizes scale by 0.8.
- Kanji sizes are px values set as inline custom properties, not Tailwind classes. The kanji and the 10px romaji are the one exception to "Tailwind default sizes only" (section 2.2). They are decorative art, hidden from screen readers, and these sizes were tested for overlap. Do not change them without a new overlap check.
- Order in the DOM is the table order. The drift follows it.

**Behaviour.**
- Pointer (`pointer: fine`): the light follows the pointer with an exponential lag of 120ms. After 3s with no pointer input, the light drifts to the nearest kanji, then from kanji to kanji. It waits 0.9s on each. It moves at 70px/s, each leg between 1.5s and 7s, with smoothstep easing. At each end of the list it turns back, so there is no long jump. Leaving the hero starts the 3s timer again.
- Touch (`pointer: coarse`): the light drifts from the first frame. A tap moves it to the tap point: a `pointerup` less than 10px from its `pointerdown`. A scroll ends in `pointercancel`, so it never moves the light. Drift starts again 3s after the tap.
- Scroll is never blocked: passive listeners only, no `preventDefault`, no `touch-action`.
- Resize: measure the hero rect and the kanji centers in a `ResizeObserver`, never inside the frame loop. After a resize, the light goes back to the first kanji.
- Pause the `requestAnimationFrame` loop when the hero is offscreen (`IntersectionObserver`) and when the tab is hidden (`visibilitychange`).
- `prefers-reduced-motion: reduce`: the loop never starts. The light stays at its CSS default on 鬼. If the setting changes while the page is open, remove `--lx` and `--ly` and stop the loop.

**Build.**
- One small client component renders layers 3 and 5 inside the `wrap` and runs the loop. The section and the text stay in the Server Component.
- No library. The prototype script is about 4KB. Keep the component under 5KB.
- Remove every listener and observer, and cancel the frame, when the component unmounts.
- Load Noto Sans JP for these glyphs (section 2.2). They are the same glyphs as the `name_ja` values.
- If the light stutters on a real phone, move the light by transform instead: each light layer is a square of the light diameter, moved with `translate`, with a fixed round mask, and its inner content moved by the opposite `translate`. The user tested the prototype on a phone and found it smooth, so this is a fallback only.

**Test.** 375, 768, 1280 and 1440px, plus 320px. Pass or fail each:
1. With JS off, 鬼 shows lit on the first frame.
2. No kanji overlaps another kanji or the text block. No horizontal scroll.
3. The brightest pixel behind the text block is not brighter than today, with the light at any position.
4. Pointer: lag, 3s idle drift, drift after leaving. Touch: tap moves the light, scroll does not.
5. Reduced motion: one still frame.
6. Screen reader: the hero reads the eyebrow, headline, paragraph and two links only.
7. The photo loads once (Network panel), with the same priority as today.
