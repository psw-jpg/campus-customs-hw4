# Usability & Business Improvements (Part 9)

A running log of improvements made in Part 9, what each one adds, and why it helps the
customer or the business.

## Frontend

### 1. Shopping cart and checkout
**What was added**
- A cart that any visitor can fill (`cartContext`, saved in the browser so it survives reloads),
  a cart link with a live item-count badge in the navbar, a **Cart page** (`/cart`) to review,
  change quantities, and remove items, and a **Checkout page** (`/checkout`) that collects name
  and email, places the order, and shows an order-confirmation screen.
- "Add to cart" on the product detail page (after a size is picked) and a quick "Add" with a
  size dropdown right on each product card, so items can be added from the grid and from
  chat-driven results without opening the product first.

**Why it helps**
- *Customer:* completes the shopping journey. Before this, you could look at products and pick a
  size but there was no way to actually buy — the experience dead-ended.
- *Business:* this is the step that turns interest into revenue. Every other feature (search,
  chat, recommendations) now leads somewhere that can produce a sale. Quick-add from cards and
  chat results shortens the path from "I want this" to "it's in my cart," which lifts conversion.

### 2. Acting on results: add-to-cart from cards and "notify me" when sold out
**What was added**
- The product cards the chat agent returns (which also populate the Products page, from Part 7)
  are now actionable: pick a size and add to the cart in place.
- When a size is sold out, the product page shows a **"Notify me when it's back"** button that
  captures the customer's email (pre-filled if they're signed in) instead of a dead end.

**Why it helps**
- *Customer:* they can act the moment they find the right thing, and a sold-out size no longer
  means "go away" — they can ask to be told when it returns.
- *Business:* captures demand at the peak moment of intent, and converts out-of-stock
  disappointment into a future sale plus a marketing contact. It also signals which sizes/items
  are in demand but unavailable.

## Backend

### 1. Orders and inventory decrement
**What was added**
- New `orders` and `order_items` tables and a `POST /api/orders` checkout endpoint. It validates
  every line against **live stock**, computes the total from database prices (never trusting the
  browser), then **decrements `inventory.quantity` and records the order in one transaction**.
  If any item can't be fulfilled it returns a clear 409 and changes nothing. Signed-in customers
  can see past orders at `GET /api/orders`.

**Why it helps**
- *Customer:* stock stays honest — they can't buy something that's actually gone, and they get a
  real confirmation with an order number.
- *Business:* enables real sales while protecting against overselling, and keeps the live stock
  the chatbot quotes accurate as orders come in. Pricing is server-authoritative, so a tampered
  browser can't change what's charged.

### 2. Email capture and lifecycle emails (using the promo opt-in)
**What was added**
- A `marketing_contacts` table that captures emails from checkout and from back-in-stock
  requests, respecting the promotional-email opt-in (which was collected at signup but unused
  until now). A `stock_notifications` table records who wants to hear about which sold-out size
  (`POST /api/notify-me`). An `email_outbox` table records the lifecycle emails the shop would
  send (order confirmation, back-in-stock acknowledgement) — a stand-in for a real email
  provider so the behavior is visible without sending anything.

**Why it helps**
- *Customer:* gets a confirmation for each order and a heads-up when a wanted item is restocked —
  communication they asked for.
- *Business:* turns data it was already collecting into a marketing channel. Email is one of the
  highest-ROI channels in retail; back-in-stock and order-confirmation messages drive repeat
  visits and recover otherwise-lost sales, and the opt-in keeps it permission-based.
