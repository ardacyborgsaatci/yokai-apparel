# DESIGN.md: Yokai Apparel

## 1. Purpose and ownership

- This file is the design spec for the Yokai Apparel store UI. The Design System session owns it (`CLAUDE.md:12`).
- The build session is the only code writer (`CLAUDE.md:13`). The Design System session writes this file only. It sends change requests as messages.
- The only token source is `src/app/globals.css`, the `@theme` block with the `--color-*` tokens. This file describes the tokens. It never defines other values. If this file and `globals.css` disagree, `globals.css` is right and this file has a bug.
- Product decisions live in `CLAUDE.md`. This file does not repeat them unless a UI rule needs them.
- References to code name the file and the thing in it (a component, function, utility, token, table or column), for example `globals.css`, `.wrap` utility. They do not use line numbers, because the code changes during each build. References to `CLAUDE.md` use line numbers. Build briefs give exact lines.

### 1.1 Code that does not match this spec yet

Audited 2026-11-20, after Phase 2: every earlier row is fixed in the code. One gap is left.

| Spec | Code today |
| --- | --- |
| Product photos follow the art direction (`CLAUDE.md:19`) | The old Unsplash set stays for now. The user picks the image source later |

### 1.2 Open items
- Phosphor icon names. The build session picks one icon per meaning and uses it everywhere.

## 2. Foundations

### 2.1 Color

| Token | Hex | Defined | Use |
| --- | --- | --- | --- |
| ink | `#0a0a0a` | `globals.css`, `--color-ink` | Page background (`globals.css`, `body` rule). Text on vermilion fills. |
| surface | `#141414` | `globals.css`, `--color-surface` | Cards, cart drawer, order summary, notices. |
| raised | `#1c1c1c` | `globals.css`, `--color-raised` | Input fill, hover fill. |
| line | `#3a3a3a` | `globals.css`, `--color-line` | Dividers and decorative box edges. Never a control edge. |
| bone | `#f2ede4` | `globals.css`, `--color-bone` | Text. Hover fill of the primary button (`page.tsx`, primary hero button). |
| muted | `#a8a39a` | `globals.css`, `--color-muted` | Secondary text. Default border of a control. |
| vermilion | `#f04e37` | `globals.css`, `--color-vermilion` | The one accent: fills, links, errors, focus ring. |

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
- A selected chip or tab changes color (bone fill, ink text), not weight (`purchase-panel.tsx`, size chip `label`).
- Text selection is vermilion with ink text (`globals.css`, `::selection` rule).
- The store has no success or warning color. A success message uses bone text and an icon.
- Photos get no vermilion tint.
- Running text may use `text-bone/90` (about 13.7 on ink). Do not go lower.

### 2.2 Type

| Role | Font | Rule | Source |
| --- | --- | --- | --- |
| Display | Anton 400 | `display` utility: uppercase, 0.02em tracking, line height 1. Fallback: Impact, Arial Narrow Bold. | `globals.css`, `--font-display` and `display` utility; `layout.tsx`, `anton` font |
| Body | Inter | Default body font. | `globals.css`, `--font-sans` and `body` rule; `layout.tsx`, `inter` font |
| Japanese name | Noto Sans JP 500 | For `name_ja` only. Set `lang="ja"`. Fallback: Hiragino Sans, Yu Gothic. | `CLAUDE.md:43` |
| Eyebrow | Inter 600 | `eyebrow` utility: 12px, uppercase, 0.2em tracking, vermilion. | `globals.css`, `eyebrow` utility |
| Group label | Inter 600 | Legend of a filter group or the size picker: same shape as the eyebrow, in muted. Form field labels are different (section 4, Form field). | `shop-view.tsx`, `FilterGroup` label |

- Load Noto Sans JP with the Google Fonts `text=` parameter. The text is the glyphs of all `name_ja` values and nothing else: `狐鬼狸河童天狗鵺幽霊絡新婦木霊獏化け猫傘おば`. The Lantern hero (section 6.5) uses the same glyphs. `next/font/google` has no `text` option (options: Next.js docs, `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md`, Reference section, options `src` to `declarations`). Use a `<link>` element.
- Sizes: Tailwind default text sizes only. No arbitrary sizes.
  - Page title: `display text-5xl sm:text-7xl` (`shop-view.tsx`, `h1`).
  - Section title: `display text-4xl sm:text-5xl` (`page.tsx`, Featured `h2`).
  - Sub-heading: `display text-3xl` (`shipping/page.tsx`, Shipping `h2`).
  - Hero: `display text-6xl sm:text-8xl lg:text-9xl` (`page.tsx`, hero `h1`).
  - Body `text-base`. Small `text-sm`. Labels `text-xs`.
  - Button label: `display text-lg` (`page.tsx`, primary hero button).
- Running text is at most about 65ch wide. Use `max-w-prose` (`about/page.tsx`, body text `div`; `products/[slug]/page.tsx`, description paragraph).

### 2.3 Layout

- `wrap` utility: max width 80rem, centered. Gutter 16px, 24px from `sm` (640), 32px from `lg` (1024) (`globals.css`, `wrap` utility).
- Breakpoints: Tailwind default. Test every page at 375, 768, 1280 and 1440 px.
- Spacing: Tailwind default 4px scale.
- Product grid: 2 columns, 3 from `md`, 4 from `lg`. Gap `gap-x-4 gap-y-10` (`shop-view.tsx`, product grid `<ul>`).
- Touch targets: at least 44px (`min-h-11`) for links and chips (`shop-view.tsx`, `Chip`). Buttons use `min-h-12` (`page.tsx`, primary hero button) or `min-h-14` (`purchase-panel.tsx`, Add to cart button).
- The header is sticky, 64px high (`site-header.tsx`, `<header>` element). Set `scroll-padding-top` to the header height on `html`, so the header never covers a focused element (WCAG 2.4.11).

### 2.4 Shape

- The store has no rounded corners. No `rounded` class exists in `src/` today. Keep it that way.
- The admin keeps the shadcn default radius.

### 2.5 Motion

| Use | Spec | Source |
| --- | --- | --- |
| Color change on hover and press | Tailwind default `transition-colors` (150ms). The pressed look starts at once (`active:duration-0`) and fades out over 150ms. | `page.tsx`, primary hero button |
| Image hover | Scale 1.05, 500ms | `page.tsx`, category tile `Image`; `product-card.tsx`, card `Image` |
| `animate-rise` | 0.7s. Only on the mobile menu. | `globals.css`, `animate-rise` utility; `site-nav.tsx`, `#mobile-menu` `<nav>` |
| Lantern light | Pointer lag 120ms, idle drift after 3s at 70px/s. Section 6.5. | Not built yet |
| Cart drawer | Slides in from the right, 250ms, `cubic-bezier(0.2, 0, 0, 1)`. Closes faster (200ms). | Not built yet |

- Motion stays within the table above. Drawer, hover and menu motion is functional. The Lantern hero (section 6.5) is the only designed moment.
- No parallax. No scroll reveals.
- Under `prefers-reduced-motion: reduce`, animation and transition durations drop to 0.001ms and smooth scroll turns off (`globals.css`, `prefers-reduced-motion` media block).

### 2.6 Focus

- Every interactive element gets `:focus-visible`: a 2px vermilion outline with a 3px offset (`globals.css`, `:focus-visible` rule).
- The ring passes because the outline sits outside the control, on the surface behind it: 5.52 on ink, 5.13 on surface, 4.75 on raised. This holds on a vermilion button too.
- A hidden radio draws the ring on its label (`purchase-panel.tsx`, size chip `label`).
- The skip link shows on focus (`layout.tsx`, skip link).

### 2.7 Icons

- The store uses Phosphor (`@phosphor-icons/react`). In Server Components, import from `@phosphor-icons/react/ssr` (`CLAUDE.md:17`).
- Store: regular weight only. Size 20px or 24px. A selected state changes color, not weight.
- A decorative icon has `aria-hidden="true"`. An icon-only button has an accessible name.
- The admin keeps Lucide inside stock shadcn components (`CLAUDE.md:44`). It also uses the few Lucide icons listed in section 7.7 (Icons): 16px, `aria-hidden`.

### 2.8 Admin theme

- shadcn/ui, dark theme, neutral base.
- `--primary` is `#f04e37`. `--primary-foreground` is `#0a0a0a`.
- Default shadcn radius. Lucide icons. Sonner toasts (`CLAUDE.md:63`).
- The admin does not use the store components in section 4.
- Admin errors and the Delete button use the stock shadcn `destructive` variant. The vermilion error rule (`CLAUDE.md:62`, Phase 2 store forms) is for the store only.
- The admin overrides one token, inside the admin scope only: `--input` is muted `#a8a39a` (7.89:1 on ink, section 2.1), so control borders pass 3:1 (`CLAUDE.md:18`). The store tokens do not change. The Phase 3 builder measures the real border contrast after install.
- Badges: order status (pending `secondary`, shipped `default`, cancelled `destructive`) and product status (Visible `secondary`, Hidden `outline`). Stock variants. The text carries the meaning.

## 3. Brand

### 3.1 Logo

- Picked: sketch A, "Charm" (user decision, 2026-11-19). A blank geometric mask with one vermilion paper charm on the brow. Not a named yokai.
- Colors: bone `#f2ede4` face, vermilion `#f04e37` charm. Flat fills. It reads at 16px.
- **Mark** (`mark.svg`, viewBox 0 0 64 64, transparent background). Use it on ink or surface only. It is not for light backgrounds.
- **Favicon** (`icon.svg`): the mark on a full ink square, radius 0, so it stays visible in a light browser tab bar. Delete `src/app/favicon.ico`, or browsers keep showing the old mask.
- **Wordmark**: live text "YOKAI APPAREL" in the `display` utility (Anton). It is not an image, because an SVG image cannot load the web font.
- **Lockup** (header): the mark at 32px (`h-8 w-8`), then the wordmark (`site-header.tsx`, logo `Link`). Approved by the user, 2026-11-20, for the Phase 3 batch:
  - From `sm` (640px): a 12px gap (`gap-3`), the wordmark at `text-xl` (116px measured).
  - Below `sm`: an 8px gap (`gap-2`), the wordmark at `text-lg` (104px measured).
  - Below 375px: the mark only. The wordmark is hidden (`max-[375px]:hidden`). Tailwind v4 compiles `max-[Npx]` to width < N, so this class shows the wordmark from 375px.
  - The link keeps `aria-label="Yokai Apparel, home"`. The mark and the text inside are `aria-hidden`.
  - Why: measured in Chrome with Anton and Inter, the mobile header (Menu or Close button, lockup, cart, two 12px gaps, 16px gutters) needs 375.2px with the menu open at `text-xl`. With `text-lg` and `gap-2` it needs 359.6px. At 360px that leaves about 0.4px of spare room, so any font rendering change wraps it. From 375px about 15px is spare. At 320px even `text-lg` does not fit.
  - Test: the build session renders the header at 320, 374 and 375px, with the menu open and closed, and reports pass or fail. The wordmark is on one line or hidden. It never wraps.
- Clear space around the mark: at least a quarter of its size. Never recolor, rotate, outline or put a shadow on it.

### 3.2 Japanese names

- Field: `name_ja`.
- Show it under the English name, on the product card and the product page. Small and muted. Noto Sans JP 500.
- Every value needs a cited folklore source (`CLAUDE.md:15`). The 12 values and their sources went to the build session on 2026-11-19. Never invent a value.

### 3.3 Imagery

- Two images per product: front, plus back or detail.
- Aspect 4:5 (`product-card.tsx`, image box; `gallery.tsx`, main image box). Garment centered on a dark seamless background. Same light in every shot.
- Lifestyle photos (Home, About) are black and white. No vermilion tint on any photo.
- Licensed photos come first. If none fits, use an AI-generated image in the same direction and mark it "AI-generated" on the Credits page (`CLAUDE.md:19`).
- Product images in the grid are decorative (`alt=""`, `product-card.tsx`, card `Image`). The gallery image carries real alt text (`catalog.ts`, `ProductImage` type).

### 3.4 Voice

- Plain, short, dry.
- No fake Japanese. No "mystic" filler.
- The folklore facts go into the product description. There is no separate folklore note block.
- Prices always show cents: "$38.00".

## 4. Components

The store builds these components and no others. Each entry gives the key rules.

### Header
- Sticky, 64px, `border-b border-line`, `bg-ink/95` with blur (`site-header.tsx`, `<header>` element).
- Desktop: logo left, links center (Shop, Tees, Hoodies, Accessories, About), cart with item count right. Mobile: Menu button, logo, cart.
- Links: `text-sm font-semibold uppercase tracking-widest`. The current page is vermilion and has `aria-current="page"` (`site-nav.tsx`, `linkClass` and the `aria-current` prop on the mobile and desktop links).
- The cart is a button with a Phosphor cart icon and the count. Its name reads "Cart, 2 items". It opens the cart drawer.

### Mobile menu
- A disclosure, not a dialog. No focus trap. The Menu button has `aria-expanded` and `aria-controls` (`site-nav.tsx`, Menu button).
- The panel sits under the header. Links use `display text-3xl`, `min-h-12` (`site-nav.tsx`, `#mobile-menu` links). It uses `animate-rise` (`site-nav.tsx`, `#mobile-menu` `<nav>`).
- Escape closes it and returns focus to the Menu button. Choosing a link closes it (`site-nav.tsx`, mobile link `onClick`).
- The Menu button has a muted border (`border-muted`), `min-h-11`.

### Footer
- Keep the wordmark and tagline block (`site-footer.tsx`, first `div` of the footer row).
- Links in order: About, Shipping & Returns, Image credits. No "Shop all". Then the demo-store line (`site-footer.tsx`, `FOOTER_LINKS` and the demo-store `<p>`).
- `border-t border-line`. Links are `text-sm`, `min-h-11`, hover vermilion (`site-footer.tsx`, footer link `Link`).

### Demo notices
- Footer line: "Demo store. No real orders or payments." in `text-sm text-muted` (`site-footer.tsx`, demo-store `<p>`).
- Payment banner: "Demo store: no real payment is taken". It sits at the top of the Payment step, always visible, not dismissible. It uses the info Inline message.

### Button
- Primary: `bg-vermilion text-ink`, hover `bg-bone` (`page.tsx`, primary hero button). Secondary: `border border-bone text-bone`, hover `border-vermilion text-vermilion` (`page.tsx`, secondary hero button).
- Both use `display text-lg`, `min-h-12`, `px-8`, radius 0. A full-width button uses `min-h-14 text-xl` (`purchase-panel.tsx`, Add to cart button).
- Text link: bone, underlined, offset 4px, hover vermilion (`purchase-panel.tsx`, Shipping & Returns link).
- Pressed (approved by the user, 2026-11-20, Phase 3 brief): every store control that has a hover look shows the same look on `active:` too. Reason: Tailwind v4 applies `hover:` only on devices that have hover, so on a phone a tap gave no feedback. Primary: bone fill. Secondary: vermilion border and text. Text links and footer links: vermilion. Menu, cart and quantity buttons, and the sort select: bone border. The pressed look starts at once (`active:duration-0`) and fades out over 150ms (section 2.5). No scale, no other motion. Chips have their own pressed look (Size picker, Filter bar). A busy or disabled control shows no pressed look. All these color pairs are already checked in section 2.1.
- Busy: the label changes ("Adding...", "Processing..."). The button has `aria-disabled="true"` and ignores presses. It keeps its full colors: no `opacity` change, because the busy label is the only progress signal and must stay readable (ink on vermilion at 70% opacity is 3.18:1). Do not use native `disabled` while busy: it drops keyboard focus. Show a busy label only while real work is pending. No artificial delay.

### Product card
- One link wraps the card (`product-card.tsx`, card `Link`). One 4:5 image (`product-card.tsx`, image box). No hover image swap.
- Under the image: English name (`display text-lg`, hover vermilion) with the price on the right (`text-sm font-semibold`, bone). Then the Japanese name, small and muted.
- Image hover: scale 1.05 over 500ms (`product-card.tsx`, card `Image`).
- All sizes sold out: the "Sold out" badge shows on the image (`product-card.tsx`, "Sold out" badge). The card stays a link.

### Product grid
- A `<ul>` of cards. 2 columns, 3 from `md`, 4 from `lg` (`shop-view.tsx`, product grid `<ul>`). Gap `gap-x-4 gap-y-10`.
- The Home featured row uses 2 columns, 4 from `lg` (`page.tsx`, Featured `<ul>`).

### Filter bar
- Three groups: category, size, sort. Each group has a label in the field-label style (`shop-view.tsx`, `FilterGroup`).
- Category: links, one per category page, so each filter result has its own address. The current one has `aria-current="page"`.
- Size: a native radio group, drawn as chips like the size picker. Sort: a native `<select>`. State stays in the URL (`catalog.ts`, `shopHref`).
- Chips and the select have `min-h-11` and a muted border. A selected chip has a bone fill and ink text.
- Pressed chip (not selected): `active:bg-raised active:border-bone` (bone on raised 14.62:1). A selected chip keeps its selected look when pressed. Timing as in section 4 Button, Pressed.
- The bar sits between two `border-line` rules (`shop-view.tsx`, filter bar `div`). The result count below uses `role="status"` (`shop-view.tsx`, result count `<p>`).

### Size picker
- A `<fieldset>` with a `<legend>`. A native radio group. The radio is visually hidden. The label is the chip (`purchase-panel.tsx`, size `fieldset`).
- Chip: `min-h-14 min-w-16`, muted border, hover bone border. Selected: bone fill, ink text.
- Pressed (not selected, not sold out): `active:bg-raised active:border-bone`, the same as the Filter bar chips. A selected chip keeps its selected look. A sold-out chip shows no pressed look.
- A sold-out size is `disabled`, has a dashed border, a struck label and the text "Sold out" (`purchase-panel.tsx`, size chip `label`). Arrow keys skip it.
- A one-size product is preselected (`purchase-panel.tsx`, `onlyOneSize`). With no size picked, Add to cart shows an error under the picker and moves focus to the first available size.

### Gallery thumbnails
- Shown only when a product has more than one image. A 4-column grid under the main image (`gallery.tsx`, thumbnail `button`). Each thumbnail is a button with `aria-pressed` and a name such as "Show image 2 of 2".
- Unselected: a 1px `border-muted` (about 7:1 on ink). Hover and pressed: `border-bone`, timing as in section 4 Button, Pressed.
- Selected: a 2px `border-vermilion`. It keeps its look on hover and press.
- Why the width change: muted and vermilion differ only by color (about 1.4:1 to each other). The thicker border shows the selected state without color alone.

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
- The card number is prefilled with the test card 4242 4242 4242 4242 (`CLAUDE.md:35`). The browser checks the format only. Card data never leaves the browser.
- The pay button reads "Pay $X.XX". While busy it reads "Processing..." and ignores presses for about 1.5s (Busy rule, section 4 Buttons). Then the confirmation page opens.

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
- A bordered block: `display text-3xl` heading, one muted line (`max-w-md`), one primary button (`shop-view.tsx`, no-results block).
- Used for an empty cart and for a shop filter with no results.

### Prose block
- Max width `max-w-prose` (65ch). Text `text-bone/90`. `space-y-6` between paragraphs (`about/page.tsx`, body text `div`).
- Sub-headings use `display text-3xl`. Links are bone, underlined, hover vermilion (`credits/page.tsx`, Unsplash License link).
- Used on About, Shipping & Returns and Image credits.

### Badges
- Store: one badge, "Sold out". `bg-ink`, bone text, `text-xs font-semibold uppercase tracking-widest`, top-left of the image (`product-card.tsx`, "Sold out" badge).

## 5. UX flows

### 5.1 Browse to confirmation

1. **Browse.** Home hero links to Shop. The header links to Shop, each category and About. Shop filters by category and size and sorts by newest, price up, price down (`catalog.ts`, `SORT_OPTIONS`). The result count updates.
2. **Product.** Two columns from `lg` (`products/[slug]/page.tsx`, product grid `div`): gallery left, details right. Details: name, Japanese name, price, description (which carries the folklore facts), size picker, Add to cart.
3. **Add to cart.** No size: error under the picker, focus on the first available size. Size picked: the cart drawer opens with the added item. The button reads "Adding..." only if the add takes time (Busy rule, section 4 Buttons).
4. **Cart drawer.** Change the quantity, remove a line, read the subtotal and the free-shipping line. "Checkout" goes to the checkout page. Close returns to the page.
5. **Checkout, Shipping.** One page, two steps. Fields follow the Form field rules. The primary button reads "Continue to payment". If a field is invalid, focus moves to the first bad field.
6. **Checkout, Payment.** Payment unlocks when Shipping is valid. Shipping collapses to a summary with an "Edit" link. Focus moves to the Payment heading. "Edit" reopens Shipping and locks Payment until Shipping is valid again.
7. **Pay.** The demo banner shows. The button reads "Processing..." for about 1.5s. The server checks stock again and saves the order as paid (demo) (`CLAUDE.md:35-36`). A stock failure shows an error Inline message above the pay button. No toast.
8. **Confirmation.** A success Inline message, the order summary, the shipping address and a "Continue shopping" link. The cart is empty.

Layout of the order summary: sticky right column on desktop, collapsed total at the top on mobile (`CLAUDE.md:61`).

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

One page, two steps (section 5.1, steps 5 to 7). Page title in the browser tab: "Checkout". The site template adds the site name (`layout.tsx`, `metadata.title.template`). The page uses the `wrap` utility and the same top padding as the other pages (`pt-12 md:pt-16`, `shipping/page.tsx`, page `div`).

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
   4. **Pay button.** Primary, full width (`min-h-14 text-xl`). Label: "Pay $89.66" (the current total). Busy: "Processing...", `aria-disabled="true"`, full colors (Busy rule, section 4 Buttons), about 1.5s. Focus stays on the button. Then the confirmation page opens.

| Label | Type, inputmode | Autocomplete | Rule | Error text | Help text |
| --- | --- | --- | --- | --- | --- |
| Card number | `text`, `numeric` | `off` | 13 to 19 digits. Spaces allowed. | "Enter a card number with 13 to 19 digits." | "Demo test card. Any future expiry date and any 3-digit CVC work." |
| Name on card | `text` | `off` | Not empty. | "Enter the name on the card." | None |
| Expiry date | `text`, `numeric` | `off` | MM / YY. Month 01 to 12. Not in the past. | "Enter a date that has not passed, like 08 / 28." | "Month and year, like 08 / 28." |
| CVC | `text`, `numeric` | `off` | 3 or 4 digits. | "Enter the 3 or 4 digit code on your card." | None |

All card fields use `autocomplete="off"` (section 4, Card payment form).

### 6.2 Shipping field list

Status: **Approved by the user, 2026-11-20.** California only and guest checkout (`CLAUDE.md:9`, `32`).

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
- **Phone: not included.** Nothing calls or texts the buyer in this demo. Order emails are out of scope (`CLAUDE.md:39`). Each extra field slows the form and adds personal data to a public demo. If a later phase needs it: add "Phone (optional)", `type="tel"`, `autocomplete="tel"`, `inputmode="tel"`, error "Enter a 10-digit US phone number, like 415 555 0100."
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
|                                      |-----------------------------| |
|                                      | Subtotal             $78.00 | |
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
   - "No confirmation email is sent."
4. **Order summary.** The same panel as Checkout, but static: `h2` "Order summary", no toggle button, no sticky position. The Total row shows at every width. The amounts come from the saved order, not from the cart.
5. **Shipping address.** `h2` "Shipping address" (`display text-3xl`). An `<address>` element (not italic): full name, address line 1, address line 2 (if any), "City, CA ZIP". No email. No phone.
6. **Continue shopping.** Text link "Continue shopping" to the shop page. `min-h-11`. It is the last item.

### 6.4 Empty and edge states

- **Checkout with an empty cart.** Show the Empty state on the checkout page. Do not redirect.
  - Why: a redirect drops the visitor on another page with no explanation. The Empty state also covers a bookmark and the Back button after an order, when the cart is empty.
  - Layout: the `h1` "Checkout", then the Empty state. No step indicator. No summary.
  - Copy: heading "Your cart is empty". Line "Add an item, then come back to check out." Button "Browse the shop" (Primary, to the shop page).
  - Load order: read the cart from browser storage first. Until then, render nothing under the title. Show the Empty state only after the read. No skeleton (`CLAUDE.md:63`).
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
  - Phase 3 (with the admin): a cart line whose product was deleted or is hidden (`is_active` false) counts as sold out and uses the same flow and copy. Each cart line keeps its own copy of the product name, so the message can name a product that no longer exists.
  - More than one line fails: write the first two sentences for each line. Then write "Check your order, then pay again." once.
  - The last line fails: the cart is empty. Show the Empty state with the line "The last item in your cart sold out. Add another item to check out."
- **Other server failure.** The same error position and rules. Text: "We could not place your order. Nothing was charged. Try again." The button returns to "Pay $89.66".

### 6.5 Home hero: Lantern

Status: **Approved by the user, 2026-11-20.** Phase 2 brief, last task. Prototype: https://claude.ai/artifact/TT8pXkh2CXRnUUjMJbtgsj. This replaces the earlier hero motion decision (rise-in) and the vertical 妖怪.

The idea: the street photo is dark at rest. A soft light circle moves over it. Inside the circle the photo is brighter and the 12 yokai names show in kanji. The light never reaches the text block.

**Keep (`page.tsx`, hero `<section>`).** The section box, the photo, the two gradients, the eyebrow, the headline, the paragraph, both buttons and their links. Same strings, sizes and spacing.

**Remove.**
- The vertical 妖怪 (`page.tsx`, the 妖怪 `<span>`).
- `animate-rise` and the `animationDelay` styles on the eyebrow, headline, paragraph and buttons (`page.tsx`, hero text block). The text is static.

**Layers, bottom to top.**

| # | Layer | Rule |
| --- | --- | --- |
| 1 | Photo | `hero-dark-street.webp`, as today. Add `unoptimized` to this `Image`, so the lit layer reuses the same cached file and the photo loads once. Keep `priority`. |
| 2 | Veil | Full cover, `ink` at 86%. The photo is almost black at rest. |
| 3 | Lit photo | The same photo with a 14% `bone` wash on top and two `screen` blend copies under it. Masked to the light circle: solid to 38% of the radius, 55% at 68%, clear at 100%. |
| 4 | Gradients | The two existing gradients (`page.tsx`, the two gradient `div`s), unchanged. |
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
| 鬼 | oni | 83%, 17%, 120px | 17%, 12.5%, 80px (y 10% from 640 to 767px) |
| 河童 | kappa | 93%, 30%, 80px | 40%, 12.5%, 48px (hidden from 640 to 767px) |
| 絡新婦 | jorogumo | 93%, 65%, 64px | Hidden |
| 幽霊 | yurei | 83%, 56%, 88px | Hidden |
| 天狗 | tengu | 84%, 85%, 72px | Hidden |
| 木霊 | kodama | 72%, 80%, 60px | Hidden |
| 化け猫 | bakeneko | 72%, 40%, 72px | Hidden |
| 傘おばけ | kasa-obake | 62%, 63%, 56px | Hidden |
| 狐 | kitsune | 62%, 22%, 96px | 61%, 6.5%, 48px |
| 獏 | baku | 40%, 8%, 48px | 61%, 18.5%, 44px (hidden below 360px and from 640 to 767px) |
| 鵺 | nue | 27%, 8.5%, 80px | 84%, 18.5%, 48px (hidden below 360px) |
| 狸 | tanuki | 12%, 9%, 64px | 84%, 6.5%, 44px |

- From 1024px to 1279px, desktop sizes scale by 0.85. Below 360px, phone sizes scale by 0.8.
- From 640 to 767px the headline is larger, so the text block is taller and the hero is 596px tall (measured). 河童 and 獏 fall into the protected area there, so hide both in that band. 4 names stay: 鬼, 狐, 狸 and 鵺. In the same band 鬼 moves up to y 10%, and the default light position (`--ay`) moves with it, because its caption crossed the protected area by 9.5px at 12.5% (measured). At 10% it clears by about 5px.
- The light has a straight edge where the protected area cuts it, near the corner of the text block. The user accepted this edge on 2026-11-20 (measured brightness step up to 37 at 640px on 鵺). Do not soften it.
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

**Test.** 320, 375, 640, 767, 768, 1280 and 1440px. Pass or fail each:
1. With JS off, 鬼 shows lit on the first frame.
2. No kanji overlaps another kanji. No kanji box, caption included, crosses the protected area (the text block plus 1rem above it and 2rem to its right). No horizontal scroll. If a name fails, report it to the Design System session. Do not move names without that session.
3. The brightest pixel behind the text block is not brighter than today, with the light at any position.
4. Pointer: lag, 3s idle drift, drift after leaving. Touch: tap moves the light, scroll does not.
5. Reduced motion: one still frame.
6. Screen reader: the hero reads the eyebrow, headline, paragraph and two links only.
7. The photo loads once (Network panel), with the same priority as today.

## 7. Admin page layouts

Status: **Approved by the user, 2026-11-20. Phase 3.**

Scope: the Phase 3 admin. Six screens: Login, Products list, New product, Edit product, Orders list and Order detail. Phase 3 builds them from this section. Section 5.2 gives the flow. This section gives the layout, the copy and the rules. Section 7.8 is the test list.

Common rules:

- **Theme.** The admin theme is in section 2.8.
- **Components.** Each region below names its stock shadcn component. The whole set is: Card, Table, Badge, Button, Input, Textarea, Select, Switch, RadioGroup, Alert, AlertDialog, Label and Sonner. No other component. No store component from section 4.
- **Type.** Inter and the stock shadcn text sizes. No Anton: the `display` utility belongs to the store.
- **Token scope.** The shadcn tokens apply inside the admin layout only. They must not change a store token (section 1, `CLAUDE.md:12`).
- **Page width.** Content max width 72rem. The gutters are the same as the `wrap` utility (section 2.3).
- **Headings.** One `h1` per page. A Card title is an `h2`.
- **Focus.** The global focus outline applies in the admin too (`globals.css`, `:focus-visible` rule, section 2.6). Do not turn it off.
- **Form behaviour.** Follow section 4, Form field. The look is stock shadcn. Differences: the error is a Lucide `CircleAlert` icon and text in `text-destructive`, `text-sm` (section 2.8). Every rule runs again on the server. A server field error looks the same and takes focus the same way.
- **Admin addresses.**

| Page | Address | Browser tab title |
| --- | --- | --- |
| Login | `/admin/login` | Admin login |
| Products list | `/admin/products` | Products |
| New product | `/admin/products/new` | New product |
| Edit product | `/admin/products/[id]` | Edit product |
| Orders list | `/admin/orders` | Orders |
| Order detail | `/admin/orders/[id]` | Order YK-10482 |

The site template adds the site name to every title (`layout.tsx`, `metadata.title.template`). In `/admin/products/[id]`, `id` is the product id (`catalog.ts`, `Product` type, `id`). In `/admin/orders/[id]`, `id` is the unguessable order id, not the short order number (section 6.4). `/admin` opens Products.

Wireframes are not to scale. Text wraps earlier in a drawing than on the real page. The wireframe legend: `[ ]` field or button, `[on ]` and `[off]` switch, `(o)` radio chosen, `( )` radio not chosen, `v` select caret, `(i)` info icon, `(!)` error icon, `[img]` photo, `<-` arrow icon, `[+ ...]` button with a plus icon, `>>` the table scrolls sideways here, `<name_ja>` the muted Japanese name, `<demo email>` and `<password>` the demo login values.

### 7.1 Shell and Login

#### Shell

Every admin page except Login uses the shell. The admin has its own layout. It does not show the store header or footer, which the root layout renders today (`layout.tsx`, `<SiteHeader />` and `<SiteFooter />`). It keeps the skip link and one `<main id="main">` (`layout.tsx`, skip link and `<main id="main">`). It holds the Sonner `Toaster`, so a toast survives a page change.

Regions, top to bottom:

1. **Top bar.** A `<header>` that holds `<nav aria-label="Admin">`. Left: three links, "Products", "Orders" and "View store". "View store" goes to `/`. Right: a "Sign out" Button (`outline`) inside a `<form>`. No sidebar.
   - The links are Buttons with `asChild`, `ghost` variant. The link of the current section is `secondary` and underlined, and has `aria-current="page"`. "Products" is current on every page under `/admin/products`. "Orders" is current on every page under `/admin/orders`. "View store" is never current.
   - The bar scrolls with the page. It is not sticky.
   - The items wrap to a second row when they do not fit (`flex-wrap`). "Sign out" stays at the right end of the last row. The 375px wireframe shows the wrapped state.
2. **Demo Alert.** Alert, default variant, Lucide `Info`. Text: "Demo admin. Anyone can change this data. Everything resets every night." It sits under the top bar, at content width, `mt-4`. It has no close button. It scrolls with the page. It is a note, not an error, so it has no `role="alert"`.
3. **Page.** `<main id="main">`. Padding `py-8`.

Session rules:

- A request for any admin address with no valid session redirects to `/admin/login?next=<the asked path and query>`. After sign-in, the visitor goes to `next`. Accept `next` only when it starts with `/admin/`. Otherwise go to `/admin/products`.
- Every admin Server Action checks the session again. The redirect alone is not enough.
- "Sign out" ends the session and opens Login. It shows no toast.

#### Login

Address `/admin/login`. It has no top bar and no shell Alert. It has its own Alert with the demo login (region 2).

The page is one Card, centered in the viewport. Max width 24rem. Use a min height for the centering, not a fixed height, so a short phone in landscape can scroll. Regions inside the Card, top to bottom:

1. **Header.** CardTitle `h1` "Admin login". CardDescription "Sign in to manage the demo store."
2. **Demo login Alert.** Alert, default variant, Lucide `Info`. AlertTitle "Demo login". Two lines: "Email: ..." and "Password: ...". The values are the demo admin from `CLAUDE.md:37`. The build session keeps them in one constant. The Alert, the button below and the script that creates the admin user all read that constant. No `role="alert"`.
3. **"Use demo login".** Button, `outline`, `type="button"`, full width. It fills Email and Password. It does not sign in.
4. **Fields.** Table below. Label above field. Both are required.
5. **Credentials error.** Hidden until a sign-in fails. Alert, `destructive`, Lucide `CircleAlert`, `role="alert"`, `tabindex="-1"`. Text: "Email or password is wrong." It sits directly above the submit Button. When it shows, focus moves to it. It is one message. It never says which part is wrong. It hides when the next sign-in starts.
6. **Submit.** Button, default variant, full width. Label "Sign in". Busy: "Signing in...", `aria-disabled="true"`, full color (section 4 Button, Busy).

| Label | Control | Rule | Error text | Help text |
| --- | --- | --- | --- | --- |
| Email | Input `type="email"`, `autocomplete="email"` | Required. Text, `@`, text, `.`, text (as section 6.2, row 1). | "Enter an email address like name@example.com." | None |
| Password | Input `type="password"`, `autocomplete="current-password"` | Required. | "Enter your password." | None |

**Login, 375px.** The `(!)` lines show only after a failed sign-in.

```
+---------------------------------+
|                                 |
| +-----------------------------+ |
| | Admin login                 | |
| | Sign in to manage the demo  | |
| | store.                      | |
| |                             | |
| | +-------------------------+ | |
| | | (i) Demo login          | | |
| | | Email: <demo email>     | | |
| | | Password: <password>    | | |
| | +-------------------------+ | |
| | [ Use demo login          ] | |
| |                             | |
| | Email                       | |
| | [                         ] | |
| | Password                    | |
| | [                         ] | |
| |                             | |
| | (!) Email or password is    | |
| |     wrong.                  | |
| | [ Sign in                 ] | |
| +-----------------------------+ |
|                                 |
+---------------------------------+
```

### 7.2 Products list

Address `/admin/products`. One Table, no search, no filter, no pagination.

Regions, top to bottom:

1. **Header row.** `h1` "Products" on the left. On the right, a Button (default variant) "Add product" with a Lucide `Plus` icon. It goes to `/admin/products/new`.
2. **Table.** The Table sits in a box that scrolls sideways on phones (section 7.7). Newest first, by `created_at` (`catalog.ts`, `Product` type, `created_at`). It lists every product, hidden ones too. The store query hides them (`store.ts`, `getStore`, `is_active` filter), so the admin list does not use it.
3. **Empty state.** With no products, the Table is replaced by a block with only the muted line "No products yet." The header "Add product" Button stays. There is no second button.

There is no Delete in a row. Delete is on the edit page (section 7.4).

| Column | Content |
| --- | --- |
| Photo | The first image by `sort` (`store.ts`, `getStore`, image sort). 40px wide, 4:5, `alt=""` because the name sits next to it. A product with no image shows an empty box of the same size. The header text is "Photo", visually hidden. |
| Name | The English name, as a link to `/admin/products/[id]`. Under it, `name_ja` in muted `text-sm` with `lang="ja"`. Leave the line out when `name_ja` is empty. |
| Category | The category name. |
| Price | `$38.00`, right-aligned (section 7.7, Formats). |
| Stock | Text from the rule below. |
| Status | A Badge. "Visible" (`secondary`) when `is_active` is true. "Hidden" (`outline`) when it is false. |

Stock text rule. `N` is the sum of the stock of all sizes. `K` is the number of sizes with stock 0.

- N is written "1 unit" or "N units".
- A clothing product with K = 0: "34 units" (Tengu Tee, `seed.sql`, `tengu-tee` stock rows). With K = 1: "32 units, 1 size sold out" (Kitsune Tee, `seed.sql`, `kitsune-tee` stock rows). With K = 2 or more: "9 units, 2 sizes sold out" (Jorogumo Hoodie, `seed.sql`, `jorogumo-hoodie` stock rows).
- A One Size product (`catalog.ts`, `ONE_SIZE`) shows only the units: "18 units" (`seed.sql`, `baku-tote` stock row), or "0 units".

Admin Badge variants are in section 2.8. The text carries the meaning, not color.

**Mobile, 375px.** The table scrolls sideways inside its box.

```
+---------------------------------+
| [Products] [Orders]             |
| [View store]         [Sign out] |
|---------------------------------|
| +-----------------------------+ |
| | (i) Demo admin. Anyone can  | |
| |     change this data.       | |
| |     Everything resets every | |
| |     night.                  | |
| +-----------------------------+ |
|                                 |
| Products        [+ Add product] |
|                                 |
|       Name           Category>> |
|---------------------------------|
| [img] Jorogumo Hoodie  Hoodie>> |
|       <name_ja>              >> |
|---------------------------------|
| [img] Kasa Cap         Access>> |
|       <name_ja>              >> |
|---------------------------------|
| [img] Oni Tee          Tees  >> |
|       <name_ja>              >> |
|                                 |
+---------------------------------+
```

**Desktop, 1280px.** The sample rows come from the seed: prices in `seed.sql`, `seed_products` rows `jorogumo-hoodie`, `kasa-cap` and `oni-tee`; stock in `seed.sql`, `seed_variants` rows for the same three products. The real page shows each stock text on one line.

```
+----------------------------------------------------------------------+
| [Products] [Orders] [View store]                          [Sign out] |
|----------------------------------------------------------------------|
| +------------------------------------------------------------------+ |
| | (i) Demo admin. Anyone can change this data. Everything resets   | |
| |     every night.                                                 | |
| +------------------------------------------------------------------+ |
|                                                                      |
| Products                                             [+ Add product] |
|                                                                      |
|       Name            Category      Price Stock            Status    |
|----------------------------------------------------------------------|
| [img] Jorogumo Hoodie Hoodies      $95.00 9 units,         [Visible] |
|       <name_ja>                           2 sizes sold out           |
|----------------------------------------------------------------------|
| [img] Kasa Cap        Accessories  $35.00 25 units         [Visible] |
|       <name_ja>                                                      |
|----------------------------------------------------------------------|
| [img] Oni Tee         Tees         $42.00 36 units,        [Visible] |
|       <name_ja>                           1 size sold out            |
|                                                                      |
+----------------------------------------------------------------------+
```

### 7.3 Product form

Addresses `/admin/products/new` and `/admin/products/[id]`. Both use the same form, on its own page. The `h1` is "New product", or "Edit <name>" with the saved name. The form is one `<form>` with `noValidate`. It is one column at every width, max width 42rem, left-aligned under the `h1`.

Regions, top to bottom:

0. **Back link.** A text link with a Lucide `ArrowLeft` icon: "All products". It goes to `/admin/products`. Use the `link` Button variant, as in section 7.6. It sits above the `h1`.
1. **Details.** Card, `h2` "Details". Fields 1 to 7 in the table below.
2. **Sizes and stock.** Card, `h2` "Sizes and stock". Fields 8 and 9.
3. **Images.** Card, `h2` "Images". Two slots. Fields 10 to 13, once per slot.
4. **Save.** Button, default variant. Label "Save product". Full width below `sm`, then auto width. Busy: "Saving...", `aria-disabled="true"`, full color (section 4 Button, Busy).
5. **Delete.** Edit page only. Section 7.4.

A new product starts with: empty fields, "Visible in store" off, "Clothing sizes (XS to XL)" with stock 0 on every size, and both image slots empty.

#### Fields

| # | Label | Control | Rule | Error text | Help text |
| --- | --- | --- | --- | --- | --- |
| 1 | Name | Input `text` | Required. Trim spaces. It needs one letter or digit, because the slug comes from it. Server check: no other product has the same slug (the seed relies on `on conflict (slug)`, `seed.sql`, `products` insert). A duplicate returns a field error under Name, and focus moves to Name. On edit the slug does not change, so a rename never causes this error. | Name rule: "Enter a name with at least one letter or number." Server check: "Another product already uses this name. Use a different name." | None |
| 2 | Japanese name (optional) | Input `text`, `lang="ja"` | None. | None | "Optional. Shown small under the English name." |
| 3 | Slug | Input `text`, `readOnly` | Never typed by hand. On a new product it follows Name until the first save. After that it is fixed. Rules below. | None | "Used in the product address. It cannot change after you save." |
| 4 | Category | Select. Options: the categories (`seed.sql`, `categories` insert). Placeholder "Choose a category". | Required. | "Choose a category." | None |
| 5 | Price | Input `text`, `inputmode="decimal"`, with a "$" prefix | Required. Digits with an optional `.` and at most 2 decimals. Greater than 0. | "Enter a price like 38.00." | "In US dollars." |
| 6 | Description | Textarea, 5 rows | Required. Trim spaces. | "Enter a description." | "Shown on the product page." |
| 7 | Visible in store | Switch with a Label to its right | When on, the Front slot must hold an image. | "Add a front image before you show this product." | "Hidden products do not show in the store." |
| 8 | Sizes | RadioGroup with the visible label "Sizes". Options "Clothing sizes (XS to XL)" and "One size". | One option is always chosen. | None | None |
| 9 | Stock for each size | One Input per row, `text`, `inputmode="numeric"`. The Label is the size. The rows sit in a `<fieldset>` with the legend "Stock per size". | Required. A whole number, 0 or more. | "Enter a whole number, 0 or more." | "0 shows as Sold out in the store." Once, under the last row. |
| 10 | Image file (each slot) | Button "Add image" (empty slot) or "Replace" (filled slot), with a hidden `<input type="file" accept="image/jpeg,image/png,image/webp">` | JPG, PNG or WebP. 2 MB or less. | "Use a JPG, PNG or WebP file of 2 MB or less." Under the slot. | "JPG, PNG or WebP. 2 MB or less." |
| 11 | Alt text (each slot) | Input `text` | Required when the slot has an image. | "Enter alt text for this image." | "Describe the image for people who cannot see it." |
| 12 | Credit name (optional) | Input `text` | None. | None | "Shown on the Image credits page. Leave it empty to keep this image off that page." |
| 13 | Credit link (optional) | Input `type="url"`, `autocomplete="off"` | If filled, it starts with `https://` or `http://`. Reason: the link shows on the public Credits page, so a value like `javascript:` must never get in. | "Enter a link that starts with https:// or http://." | "Optional. Makes the credit name a link." |

Rules by field:

- **Slug.** Never typed by hand. On a new product it follows Name as the visitor types, until the first save. After that it is fixed. Rule: lower case. Each run of characters that are not a to z or 0 to 9 becomes one hyphen. No hyphen at the start or end. "Kitsune Tee" gives `kitsune-tee` (`seed.sql`, `kitsune-tee` product row).
- **Price.** The value has no "$". The server stores whole cents: dollars times 100, rounded (`price_cents`, `catalog.ts`, `Product` type).
- **Visible in store.** The check runs when the switch turns on, on blur, and again when the Front image changes (after the first error). Front holds an image when it has a saved image or a picked file. The server runs the same check on save.
- **Sizes.** "Clothing sizes (XS to XL)" shows 5 rows: XS, S, M, L, XL (`catalog.ts`, `CLOTHING_SIZES`). "One size" shows 1 row, labelled "One Size", saved as `One Size` (`catalog.ts`, `ONE_SIZE`). Switching the type shows the rows of the other type. The form keeps both sets of stock values in its state while the page is open, so switching back restores them. No dialog. New rows start at 0 only the first time a type is shown. Save writes only the chosen type and replaces the sizes of the product. A stock of 0 shows "Sold out" in the store (`CLAUDE.md:36`).

#### Image slots

- Two fixed slots, "Front" and "Back or detail". Each is a `<fieldset>` with the slot name as its legend.
- The slot sets the order: Front is `sort` 0 and Back or detail is `sort` 1 (`seed.sql`, `kitsune-tee` rows in `seed_images`). No drag. Removing Front does not move Back or detail into Front.
- **Filled slot.** A 4:5 preview, 8rem wide, then the "Replace" Button (`outline`) and the "Remove" Button (`ghost`). Then Alt text, Credit name and Credit link. From `sm` (640px) these fields sit to the right of the preview. Below `sm` they sit under it. Arithmetic check: at 375px a Card has 295px of content (343px of page, less 2 x 24px of stock Card padding). A preview (128px), a gap (16px) and a field of at least 192px need 336px. That does not fit. At 640px a Card has at least 544px. That fits.
- **Empty slot.** A 4:5 box with the text "No image", and the "Add image" Button. The alt and credit fields stay hidden until the slot has an image.
- **Pick.** On pick, the browser checks the type (`image/jpeg`, `image/png`, `image/webp`) and the size (2 MB, which is 2,097,152 bytes, `CLAUDE.md:37`). A bad file is not taken. The slot keeps its earlier state. The error shows under the slot. Focus stays on the slot Button.
- **Preview.** The preview shows the local file until the form saves. Nothing uploads on pick. A file that is never saved is never uploaded.
- **Remove.** It clears the preview, the alt text and the credit fields of that slot. It asks nothing. It takes effect when the form saves.
- **Save.** The server checks again: size, and type from the file bytes, not from the file name. The error text is the same. A file that passes goes to Supabase Storage (`CLAUDE.md:50`). Its path goes in `product_images` (`seed.sql`, `product_images` insert).

#### Save and result

- Success: Sonner toast "Product saved". A new product then opens its own edit page, and the toast shows there. An edited product stays on the page, and the form shows the saved values.
- Failure: section 7.7.
- No unsaved-changes warning. Leaving the page drops the changes without asking.
- Check order on submit: page order. The first invalid field takes focus. A file error takes focus on the slot Button.

**Edit product, 1280px.** The `(!)` lines show only after an error. The Back or detail slot shows the empty state with a file error. The Delete button is on the edit page only.

```
+----------------------------------------------------------------------+
| (shell: top bar and demo Alert, see 7.2)                             |
|                                                                      |
| <- All products                                                      |
|                                                                      |
| Edit Kitsune Tee                                                     |
|                                                                      |
| +----------------------------------------+                           |
| | Details                                |                           |
| | Name                                   |                           |
| | [Kitsune Tee                         ] |                           |
| | Japanese name (optional)               |                           |
| | [<name_ja>                           ] |                           |
| | Slug                                   |                           |
| | [kitsune-tee                         ] |                           |
| | Used in the product address. It        |                           |
| | cannot change after you save.          |                           |
| | Category                               |                           |
| | [Tees                               v] |                           |
| | Price                                  |                           |
| | [$ 38.00                             ] |                           |
| | In US dollars.                         |                           |
| | Description                            |                           |
| | [White cotton tee. Relaxed fit.      ] |                           |
| | [                                    ] |                           |
| | [                                    ] |                           |
| | [on ] Visible in store                 |                           |
| | Hidden products do not show in the     |                           |
| | store.                                 |                           |
| +----------------------------------------+                           |
| +----------------------------------------+                           |
| | Sizes and stock                        |                           |
| | Sizes                                  |                           |
| | (o) Clothing sizes (XS to XL)          |                           |
| | ( ) One size                           |                           |
| | Stock per size                         |                           |
| | XS  [4                               ] |                           |
| | S   [12                              ] |                           |
| | M   [10                              ] |                           |
| | L   [6                               ] |                           |
| | XL  [0                               ] |                           |
| | 0 shows as Sold out in the store.      |                           |
| +----------------------------------------+                           |
| +----------------------------------------+                           |
| | Images                                 |                           |
| | Front                                  |                           |
| | +----------+  Alt text                 |                           |
| | |          |  [White t-shirt on a ha ] |                           |
| | |  [img]   |  Credit name (optional)   |                           |
| | |   4:5    |  [Avtar Singh           ] |                           |
| | |          |  Credit link (optional)   |                           |
| | +----------+  [https://unsplash.com/p] |                           |
| | [Replace]                              |                           |
| | [Remove]                               |                           |
| |                                        |                           |
| | Back or detail                         |                           |
| | +----------+                           |                           |
| | |          |                           |                           |
| | | No image |                           |                           |
| | |          |                           |                           |
| | +----------+                           |                           |
| | [Add image]                            |                           |
| | (!) Use a JPG, PNG or WebP file of     |                           |
| |     2 MB or less.                      |                           |
| +----------------------------------------+                           |
|                                                                      |
| [ Save product ]                                                     |
|                                                                      |
|----------------------------------------------------------------------|
| [ Delete product ]                                                   |
|                                                                      |
+----------------------------------------------------------------------+
```

### 7.4 Delete

Delete exists on the edit page only. The New page, the list rows and the Orders pages have none.

1. **Button.** Below the Save Button there is a `border-t` rule with `mt-8 pt-8`. Under the rule: a Button, `destructive` variant, "Delete product". The rule and the space keep it away from Save, so a stray click is unlikely.
2. **Dialog.** The Button opens an AlertDialog.
   - Title: "Delete <name>?" The name is the saved name. Example: "Delete Kitsune Tee?"
   - Body: "It leaves the store now. Past orders keep their own copy of the name, size and price."
   - Two buttons. "Cancel" (AlertDialogCancel). "Delete product" (AlertDialogAction, `destructive`). Focus starts on "Cancel".
   - Escape or "Cancel" closes it. Focus returns to the "Delete product" Button on the page.
   - Busy: the action reads "Deleting...", `aria-disabled="true"`, full color (section 4 Button, Busy).
3. **Success.** The Products list opens. Sonner toast "Product deleted". The list no longer has the product.
4. **Failure.** The dialog stays open. The action returns to "Delete product". Sonner error toast "Could not save. Try again." (section 7.7).

Data rule. It is already queued with the build session.

- An order line stores its own name, size, unit price and quantity. It does not read them from the product.
- `product_id` on an order line is set to null when its product is deleted (a foreign key with `on delete set null`).
- Order detail (section 7.6) shows the line copy. It never needs the product.
- The sizes and the images of the deleted product go with it, rows and stored files.

### 7.5 Orders list

Address `/admin/orders`. One Table. No search, no filter, no pagination. Newest first, by order date.

Regions, top to bottom:

1. **Header.** `h1` "Orders".
2. **Table.** The Table sits in a box that scrolls sideways on phones (section 7.7).
3. **Empty state.** With no orders, a block replaces the Table: the muted line "No orders yet. Orders from the store show up here." It has no button.

| Column | Content |
| --- | --- |
| Order | The order number, for example "YK-10482" (format: "YK-" and 5 digits, section 6.3). It is a link to `/admin/orders/[id]`. |
| Date | The order date (section 7.7, Formats). |
| Customer | The full name. Under it, the email in muted `text-sm`. |
| Items | The sum of the quantities of all lines, right-aligned. An order with Kitsune Tee, quantity 1, and Baku Tote, quantity 1, shows 2. |
| Total | The saved order total with cents, right-aligned. |
| Status | A Badge. Map from section 2.8: pending `secondary`, shipped `default`, cancelled `destructive`. The labels are "Pending", "Shipped" and "Cancelled". |

**Desktop, 1280px.** The sample customers are made up for the drawing. The real page shows each date on one line.

```
+----------------------------------------------------------------------+
| (shell: top bar and demo Alert, see 7.2)                             |
|                                                                      |
| Orders                                                               |
|                                                                      |
| Order     Date           Customer         Items    Total Status      |
|----------------------------------------------------------------------|
| YK-10482  Nov 20, 2026,  Ana Ruiz             2   $89.66 [Pending]   |
|           3:42 PM        ana@example.com                             |
|----------------------------------------------------------------------|
| YK-10481  Nov 19, 2026,  Sam Lee              1   $46.76 [Shipped]   |
|           9:15 AM        sam@example.com                             |
|----------------------------------------------------------------------|
| YK-10480  Nov 18, 2026,  Mia Chen             2  $128.70 [Cancelled] |
|           6:08 PM        mia@example.com                             |
|                                                                      |
+----------------------------------------------------------------------+
```

### 7.6 Order detail

Address `/admin/orders/[id]`. An unknown id calls `notFound()`. The page is one column at every width, max width 42rem, left-aligned. The order is read-only except its status.

Regions, top to bottom:

1. **Back link.** A text link with a Lucide `ArrowLeft` icon: "All orders". It goes to `/admin/orders`. Use the `link` Button variant.
2. **Header.** `h1` "Order YK-10482". Under it, one row: the order date (section 7.7, Formats) and the status Badge (same map as 7.5). The Badge follows the saved status.
3. **Status.** Card, `h2` "Status".
   - A Select with the options "Pending", "Shipped" and "Cancelled" (`CLAUDE.md:26`). It shows the saved status. Its accessible name comes from the Card title (`aria-labelledby`).
   - A Button, default variant, "Update status". Busy: "Saving...", `aria-disabled="true"`, full color (section 4 Button, Busy).
   - Success: Sonner toast "Status updated". The Badge in the header changes. The page stays open.
   - Failure: section 7.7.
   - The status is a label only. No status changes the stock. A cancelled order does not give stock back.
4. **Items.** Card, `h2` "Items".
   - A Table with the columns Item, Size, Qty, Price and Total. Item is the name saved on the line. Size is the size saved on the line ("One Size" for a one-size product). Price is the unit price. Total is the line total. Price and Total are right-aligned.
   - Under the Table, a `border-t` block with four rows of text, label on the left and amount on the right: "Subtotal", "Shipping" ($6.00, or "Free" at $100.00 or more), "Estimated tax (7.25%)" and "Total" (`font-semibold`). The amounts are the saved amounts (money rules, section 6.1, region 2).
   - The Table box has `tabindex="0"`, `role="region"` and `aria-label="Order items"`. It has no focusable content, so it needs its own tab stop to scroll by keyboard on a phone.
5. **Customer.** Card, `h2` "Customer". A description list (`<dl>`):
   - "Shipping address": an `<address>` element (not italic): full name, address line 1, address line 2 (if any), "City, CA ZIP" (section 6.3, region 5).
   - "Email": the email.
   - "Payment": "Paid (demo)" (`CLAUDE.md:35`).

**Desktop, 1280px.** The sample order is the one in section 6.1.

```
+----------------------------------------------------------------------+
| (shell: top bar and demo Alert, see 7.2)                             |
|                                                                      |
| <- All orders                                                        |
|                                                                      |
| Order YK-10482                                                       |
| Nov 20, 2026, 3:42 PM  [Pending]                                     |
|                                                                      |
| +----------------------------------------+                           |
| | Status                                 |                           |
| | [Pending                            v] |                           |
| |                                        |                           |
| | [ Update status  ]                     |                           |
| +----------------------------------------+                           |
| +----------------------------------------+                           |
| | Items                                  |                           |
| | Item        Size     Qty  Price  Total |                           |
| |----------------------------------------|                           |
| | Kitsune Tee M          1 $38.00 $38.00 |                           |
| | Baku Tote   One Size   1 $40.00 $40.00 |                           |
| |----------------------------------------|                           |
| | Subtotal                        $78.00 |                           |
| | Shipping                         $6.00 |                           |
| | Estimated tax (7.25%)            $5.66 |                           |
| |----------------------------------------|                           |
| | Total                           $89.66 |                           |
| +----------------------------------------+                           |
| +----------------------------------------+                           |
| | Customer                               |                           |
| | Shipping address                       |                           |
| | Ana Ruiz                               |                           |
| | 123 Example St                         |                           |
| | Unit 4                                 |                           |
| | Oakland, CA 94607                      |                           |
| | Email                                  |                           |
| | ana@example.com                        |                           |
| | Payment                                |                           |
| | Paid (demo)                            |                           |
| +----------------------------------------+                           |
|                                                                      |
+----------------------------------------------------------------------+
```

### 7.7 Cross-cutting rules

#### Phones

- Each Table sits in its own box with `overflow-x-auto`. The box scrolls sideways at any width where the Table does not fit. Below `md` (768px) it is expected to scroll.
- The page never scrolls sideways. Every parent of a Table box can shrink (`min-w-0`), so a wide Table cannot widen the page.
- The Products and Orders boxes hold links, so they need no extra tab stop. The Order items box has its own (section 7.6).
- Forms are one column, max width 42rem, at every width (section 7.3). Order detail follows the same rule (section 7.6).

#### Failures

- Scope: a server failure on product save, on delete and on status update.
- The button returns to its label ("Save product", "Delete product", "Update status") and is enabled again. The form values stay.
- Sonner error toast, with this text: "Could not save. Try again."
- A field error never goes in a toast. It shows under its field (section 7.3). A failed sign-in is not a toast either (section 7.1).

#### Not found (Phase 5)

- An unknown admin id (`/admin/orders/<id>`, `/admin/products/<id>`) shows a page inside the admin shell, not the store 404. It happens often: the nightly reset deletes rows that an open admin tab may still show.
- Stock shadcn. Heading (`h1`): "Not found". Text: "This order or product does not exist. The nightly demo reset may have removed it." Button (default variant, a link): "Back to admin", to `/admin`.
- Until Phase 5 ships it, the store 404 is accepted.

#### Loading

- Same as the store: no skeletons, a plain block of the same height (section 1.1, row "Suspense fallback", and `CLAUDE.md:63`).

#### Formats

- Dates look like "Nov 20, 2026, 3:42 PM". Always in Pacific time. Use `Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })`. Checked on 2026-11-20 with Node 26.13.0: the output for 2026-11-20T23:42:00Z is "Nov 20, 2026, 3:42 PM". The fixed time zone also makes the server and the browser print the same text. A browser may put a narrow no-break space before "PM". That is fine.
- Money always shows cents: "$38.00". Use `formatPrice` (`format.ts`, `formatPrice`).
- Order numbers: "YK-" and 5 digits (section 6.3).

#### Icons

Lucide, 16px, `aria-hidden`: `Info` on notices, `CircleAlert` on errors, `Plus` on "Add product", `ArrowLeft` on "All orders" and "All products". No other icon, except the icons inside stock components (for example the Select caret and the Sonner toast icons).

#### Seed and reset (requirement for the build session)

This touches the seed file and the nightly cron job.

- The seed creates 6 demo orders with mixed statuses. Use each of the three statuses at least once. Each order has 1 to 3 lines, the shipping fields, amounts that follow the money rules (section 6.1) and the payment state "paid (demo)" (`CLAUDE.md:35`).
- The nightly reset (`CLAUDE.md:38`) deletes every row that the seed does not list: products, sizes, images, orders and order lines. It also deletes all uploads. Then it writes the seed rows, including the 6 orders.
- Conflict to fix: the seed file says it "never deletes anything" (`seed.sql`, header comment). The reset needs a delete step first. The build session changes the seed file or the cron job.
- The seed orders do not change stock. Stock stays as in `seed.sql`, `seed_variants` insert. "A saved order reduces stock" (`CLAUDE.md:36`) is true for orders from checkout only.
- Order lines follow the data rule in section 7.4.

#### Credits page (requirement for the build session)

This changes the store page `/credits`.

- The page lists an image when it has a credit name. The credit link is optional. Today the page needs both (`credits/page.tsx`, `productCredits` filter). A row with a name and no link shows the name as plain text. An image with no credit name is not listed.
- The database must allow an empty credit name and an empty credit link. `catalog.ts` types both as `string | null` (`ProductImage` type, `credit_name` and `credit_url`). The orders tables are defined in `supabase/migrations/20261120020838_orders.sql` (table `orders` and table `order_items`). The `products` and `product_images` table definitions are not in the repo: `grep -rni "create table" supabase/` finds only those two. So the build session checks in Supabase that both credit columns are nullable.
- The page says that all photos come from Unsplash (`credits/page.tsx`, intro paragraph) and each row ends "on Unsplash" (`credits/page.tsx`, credit row link text). An upload can come from any source. Change the text so it is true for any source.

### 7.8 Test list for Phase 3

The Phase 3 builder fills every Result cell with Pass or Fail. A cell with no result counts as Fail. Test in the shadcn dark theme with `--primary` `#f04e37` and `--primary-foreground` `#0a0a0a` (5.52:1, section 2.1). Test at 375, 768, 1280 and 1440px.

Run the project test matrix (`CLAUDE.md:69`) on all 6 admin pages, with the methods H, K, F, T, B, E below. Report pass or fail per page and width.

Every keyboard claim in the report states the exact keys pressed and what happened. A claim without steps counts as not verified.

Methods:

- **H, horizontal scroll.** At each width, `document.documentElement.scrollWidth` equals `clientWidth`. On the Products list and the Orders list at 375px, the Table box scrolls sideways and the page does not.
- **K, keyboard path.** Use Tab and Shift+Tab. Use the keys each control needs: Enter or Space opens a Select and arrow keys pick; Space toggles a Switch; arrow keys move in a RadioGroup. Every control is reachable. The order follows the page order. In the AlertDialog, focus stays inside it, Escape closes it and focus returns to "Delete product".
- **F, visible focus.** Every control shows a change when it has focus.
- **T, text contrast.** 4.5:1 for normal text, 3:1 for large text, on the real background. Include muted text, the placeholder text, the text of every Badge variant in use (`secondary`, `default`, `destructive`, `outline`), the text in both Alert variants, and the toast text. For each failure write the two colors and the ratio.
- **B, control border contrast.** 3:1 for the border or fill that shows the edge of a control (WCAG 1.4.11, `CLAUDE.md:18`). Include Input, Textarea, Select trigger, Switch, RadioGroup and the `outline` Button. For each failure write the two colors and the ratio.
- **E, errors.** Trigger every error text in the tables of 7.1 and 7.3. E covers errors that belong to a field. The Login credentials error has no field. R2 covers it. Pass when the text shows under its field with its icon, the field has `aria-invalid="true"`, and on submit focus lands on the first invalid field. For New product and Edit product, include the file error under each slot and the Credit link error (a value like `javascript:alert(1)` in a slot that has an image). For New product, include the duplicate-name error: save a second product with the name of an existing one, and check that focus lands on Name. For Edit product, include the toast "Could not save. Try again." For Order detail, only the toast applies. E applies to Login, New product, Edit product and Order detail only. List how each error was triggered.

Control borders: the admin overrides `--input` (section 2.8). Test B confirms the real contrast.
If B fails, write Fail and send the result to the Design System session. Do not change a token without that session (`CLAUDE.md:12`).

Behaviour checks. Run each once at 1280px, and R1, R2, R5 and R6 again at 375px. The width checks above cover layout at every width.

| ID | Check | Result |
| --- | --- | --- |
| R1 | An admin address with no session opens Login. After sign-in, the asked page opens. A `next` value that does not start with `/admin/` is ignored. |  |
| R2 | "Use demo login" fills both fields and does not sign in. A wrong password shows "Email or password is wrong." above the submit button, and focus moves to it. |  |
| R3 | "Sign out" opens Login and shows no toast. |  |
| R4 | The Products list shows hidden products, newest first. The Stock text is right for a product with all sizes in stock, a product with one size sold out, a product with two sizes sold out and a One Size product. |  |
| R5 | New product: with "Visible in store" on and no Front image, the error shows under the switch. With valid data, Save shows "Product saved" and opens the edit page. |  |
| R6 | A 3 MB file and a GIF file each show "Use a JPG, PNG or WebP file of 2 MB or less." under the slot. Nothing uploads before Save. |  |
| R7 | Delete: the dialog shows the title and body from 7.4. Escape closes it and focus returns to "Delete product". Delete opens the Products list with "Product deleted". An order that held the product still shows its name, size and price. |  |
| R8 | Order detail: "Update status" shows "Status updated" and the Badge changes. Product stock does not change. |  |
| R9 | With the network blocked, "Save product", the dialog "Delete product" and "Update status" each show "Could not save. Try again." The button returns to its label and the form values stay. |  |
| R10 | Credits page: an upload with a credit name and no link shows the name as plain text. An upload with no credit name is not listed. |  |
| R11 | After a manual run of the nightly reset: exactly 6 orders with mixed statuses, and no product or upload that was added in the admin. |  |
| R12 | A product saved in the admin shows in the store at once (the `catalog` tag refreshes). |  |
| R13 | Every date is in Pacific time, like "Nov 20, 2026, 3:42 PM". Every price has cents. |  |

### 7.9 Build notes

- **Upload display.** Image paths are files in `public/images` today (`seed.sql`, `seed_images` rows), and the store passes `path` to `next/image` (`product-card.tsx`, card `Image`; `gallery.tsx`, main `Image`). An upload lives in Supabase Storage. `next.config.ts` has no `images.remotePatterns` (`next.config.ts`, `nextConfig` object), so add one for that host. Without it the store cannot show an upload.
- **Upload size.** The default limit of a Server Action body is 1MB (Next.js docs, `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md`, `bodySizeLimit`). Set `serverActions.bodySizeLimit` to `3mb`. The limit counts multipart bytes, so keep 10 to 20 KB of room (Next.js docs, `serverActions.md`, `bodySizeLimit`). Send each image in its own request: two 2 MB files in one request are about 4 MB.
- **Store cache.** The store reads the catalog through a cache that lasts hours, with the tag `catalog` (`store.ts`, `getStore`, `cacheLife` and `cacheTag`). After each product save or delete, refresh that tag. Otherwise the store shows old data for hours.
