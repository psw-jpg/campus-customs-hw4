# Design Changes (Part 10)

Goal: make Campus Customs look and feel more like the reference site,
**yalebulldogblue.com** — crisp, product-first, and clearly Yale — without adding any new
features. All changes are visual (CSS, fonts, and hero markup).

## 1. Color palette
**What changed**
- Brand navy updated to **`#00366b`** to match the reference exactly (was `#00356b`).
- Added a disciplined **gray ramp** mirroring the reference: section backgrounds
  `#f4f4f4`/`#f6f6f6`, borders `#dddddd`/`#ededed`, secondary text `#4d4d4d`/`#949494`, near-black
  body text `#1d1d1d`.
- Added two **accent colors used sparingly** — pink `#eb1256` and coral `#f04f36` (for future
  sale/urgency) — as design tokens, matching the reference's restrained accent use.
- Secondary color shifted to the reference's teal `#046e82`.

**Why:** the reference relies on one strong navy plus a neutral gray system and tiny accent
pops, which keeps the product the focus. A single flat blue (as before) looked thinner and less
considered.

## 2. Typography
**What changed**
- Headings now use **Nunito Sans** (700–900); body and nav stay on **Open Sans** — the same
  pairing the reference site uses. Loaded both from Google Fonts.
- Kept case and letter-spacing restrained (normal case, minimal tracking), as the reference does.

**Why:** Nunito Sans gives headings a friendlier, rounder, more collegiate feel while Open Sans
keeps body text highly readable — matching the reference's clean, approachable voice.

## 3. Squared corners (the biggest visual shift)
**What changed**
- Set the global corner radius to **0** and squared buttons, inputs, product cards, chips,
  badges, color pills, and panels. Only two round elements remain: the circular chat launcher
  and the small cart-count badge (both are icon circles).

**Why:** the reference site is uniformly rectangular (`border-radius: 0`). Our previous rounded
cards and pill buttons read as a different, softer brand. Squaring everything is the single
change that most makes our site resemble theirs.

## 4. Hero — product-first and image-led
**What changed**
- Replaced the full-width blue gradient banner with a **two-column hero**: headline and a single
  clear CTA on the left over solid navy, and a **product image on the right**.

**Why:** the reference leads with imagery, not a plain color block. An image-led hero is more
inviting and immediately signals "this is a shop," directing attention toward products and the
primary call to action.

## 5. Product cards
**What changed**
- Image area now sits on a lighter `#f6f6f6` panel, and images gain a **subtle zoom on hover**;
  the card keeps a crisp border and a restrained shadow on hover (no lift/bounce).

**Why:** the reference uses interactive, hover-responsive cards on neutral backgrounds. The quiet
zoom adds life and signals interactivity without the playful motion we had before, keeping the
feel premium and product-focused.

## Not changed (intentionally)
- No new features or "innovations" — this pass is purely visual, per the brief.
- The chat panel keeps its friendly, approachable feel; the reference's own assistant is only a
  search/policies helper, so our assistant stays a differentiator rather than copying theirs.
- Buttons, layout structure, and the cart/checkout flow from Part 9 are unchanged in behavior;
  only their styling was updated to the new system.

## Verification
- Frontend build and lint pass.
- Confirmed live on the dev server: navy `#00366b`, `--radius: 0px`, the Nunito Sans font link,
  and the hero product image all load correctly.
- Note: a pixel-level visual pass in a browser wasn't possible this session (the browser tool was
  unavailable), so the above is verified by build output and served assets rather than by eye.

---

## Part 10 (continued): Interactive polish + Bulldog avatar

After the visual match to the reference, we added the "table-stakes" interactions that keep
people browsing and buying, plus a branded assistant avatar to give the chat presence.

### Loading skeletons
- The Products grid and the product page now show shimmering **skeleton placeholders** while
  data loads, instead of plain "Loading…" text.
- *Why:* perceived speed. A shaped, animated placeholder feels faster and more polished than a
  blank wait, which reduces early bounce.

### Scroll-reveal
- Homepage sections and cards **fade/slide in as they scroll into view** (and respect
  `prefers-reduced-motion`).
- *Why:* gentle motion rewards scrolling and draws the eye down the page toward products and CTAs,
  increasing time on site.

### Quick view
- Every product card has a **"Quick view"** button (on hover) that opens a modal with the image,
  price, description, size picker, and add-to-cart — without leaving the grid.
- *Why:* lets customers evaluate and buy more products per visit with fewer clicks, which lifts
  both browsing depth and conversion.

### Sticky add-to-cart bar
- On the product page, once the customer scrolls past the main buy button, a slim **sticky bar**
  with the product, price, size selector, and Add to cart pins to the bottom.
- *Why:* keeps the purchase action one click away at all times — a proven conversion booster.

### Handsome Dan — the assistant avatar with presence
- The chat assistant is now **Handsome Dan**, an SVG bulldog (code, not a raster image, per class
  convention). He appears: as the **floating launcher** (with a gentle idle bob, a blink, and a
  "Hi! 🐾" nudge), in the **chat header**, and **beside every assistant message**; while thinking,
  the typing indicator shows an **animated** Dan.
- *Why:* the assistant is our main differentiator from the reference store. Giving it a friendly,
  on-brand character makes it feel like a real in-store associate, which encourages longer,
  more exploratory sessions and builds trust toward purchase.

### Intentionally skipped
- **Star ratings / review counts:** we have no real review data, and showing invented ratings
  would be dishonest (and off-brand for an assistant we built to be truthful). This is better
  added later with a real reviews feature.
- **Hover image-swap:** each product has a single catalogue image, so there's no second photo to
  swap to; we use a subtle hover zoom instead.

### Refinements: full-body Dan + warmer hero
- **Handsome Dan redrawn as a full sitting bulldog** with no surrounding circle: fawn body,
  floppy ears, white snout, dark nose, paws, and a navy Yale collar with a gold "Y" tag.
- **More interactive:** idle breathing, blinking, and a wagging tail when animated (the launcher);
  and on hover *any* Dan tilts his head, perks up, wags faster, and sticks his tongue out. The
  floating launcher is now just Dan himself (with a soft drop shadow), not a blue button.
- **Hero image swapped** to the Yale vintage-bulldog crewneck, shown on a clean white panel —
  warmer and more welcoming than the dark navy hoodie (which blended into the navy hero), and it
  ties the homepage to Handsome Dan.

### More refinements: Dan's jersey, hero carousel, The Game countdown
- **Handsome Dan now wears a navy Yale shirt** with a white serif "Y" on the chest.
- **Hero is now a rotating carousel** of five well-stocked products (one per category:
  football tee, Branford ¼-zip, vintage-bulldog crewneck, Divinity fleece, Champion hoodie). It
  auto-advances, has prev/next arrows and dots, pauses on hover, and **each slide links to that
  product's single-item page**.
- **A live Harvard–Yale "The Game" countdown** was added to the homepage (days/hours/minutes/
  seconds to kickoff), alongside a grid of **game-day gear** (Harvard–Yale tee, football tee,
  GameDay hood, Boola Boola tee, etc.) pulled live from the catalogue by keyword. The countdown
  date is configurable in `GameCountdown.tsx`.

*Why:* the carousel showcases more inventory the moment someone lands and routes them straight to
buyable pages; the countdown creates timely urgency around a marquee event and merchandises the
exact products tied to it — both push dwell time and conversion.

### Celebrations + bolder Game section
- **Countdown now stands out:** The Game section is a full-width navy band with a kicker, large
  heading, and oversized countdown tiles (with a subtle pulse) — much more prominent than the
  earlier inline version.
- **Game-day products are a horizontal rail** (`ProductRail`): all in one line with prev/next
  arrows and swipe/scroll-snap, instead of a wrapping grid.
- **Add-to-cart celebration:** every add pops a toast where **Handsome Dan celebrates** (a happy
  jump/wiggle) with the item name — fired centrally from the cart, so it works from product cards,
  the detail page, and Quick View alike.
- **Order confetti:** the order-confirmation screen bursts **Yale-colored confetti** (navy, gold,
  white, pink) with **Handsome Dan in a party hat**, celebrating.
- All celebration/countdown motion respects `prefers-reduced-motion`.

*Why:* the bold countdown and single-line rail make the marquee event impossible to miss and easy
to shop; the celebratory moments add delight and positive reinforcement at the two key conversion
steps (adding to cart, completing a purchase), which encourages people to keep going.

### Dan "thinking" while a reply loads
- While the agent is composing a reply, the chat now shows **Handsome Dan thinking**: his head
  tilts side to side, his eyes ponder, and a **thought bubble with three pulsing dots** floats
  above him, next to a "Handsome Dan is thinking…" line (replaces the old plain typing dots).
- *Why:* embodying the wait in the character makes the (sometimes multi-second) agent response
  feel intentional and charming rather than like a lag, keeping the customer engaged.
