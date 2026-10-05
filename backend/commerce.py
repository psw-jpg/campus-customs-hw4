"""Checkout, orders, inventory decrement, and email capture for Campus Customs.

Orders reduce real stock in the `inventory` table inside one transaction, so the
shop never oversells. Email addresses from checkout and back-in-stock requests are
captured into `marketing_contacts` (respecting the promo opt-in), and the
lifecycle emails we would send are recorded in `email_outbox` — a stand-in for a
real email provider so the behavior is visible without sending anything.
"""

from __future__ import annotations

from datetime import datetime, timezone

from models import NotifyRequest, OrderConfirmation, OrderItemIn, OrderLine
from tools import get_db


class StockProblem(Exception):
    """Raised when one or more cart lines can't be fulfilled from current stock."""

    def __init__(self, problems: list[str]):
        self.problems = problems
        super().__init__("; ".join(problems))


def init_db() -> None:
    """Create the commerce tables if they don't exist yet."""
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                email TEXT NOT NULL,
                subtotal REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'confirmed',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id TEXT NOT NULL,
                size TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            );
            CREATE TABLE IF NOT EXISTS stock_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                product_id TEXT NOT NULL,
                size TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                notified INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS marketing_contacts (
                email TEXT PRIMARY KEY,
                promo_opt_in INTEGER NOT NULL DEFAULT 0,
                source TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS email_outbox (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                to_email TEXT NOT NULL,
                subject TEXT NOT NULL,
                body TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            """
        )
        conn.commit()


def _queue_email(to_email: str, subject: str, body: str) -> None:
    """Record an email we would send (no real provider is wired up)."""
    with get_db() as conn:
        conn.execute(
            "INSERT INTO email_outbox (to_email, subject, body) VALUES (?, ?, ?)",
            (to_email, subject, body),
        )
        conn.commit()
    print(f"[email] to={to_email} subject={subject!r}")


def capture_contact(email: str, promo_opt_in: bool, source: str) -> None:
    """Save an email for future marketing. A later opt-in never downgrades an existing one."""
    with get_db() as conn:
        conn.execute(
            """INSERT INTO marketing_contacts (email, promo_opt_in, source)
               VALUES (?, ?, ?)
               ON CONFLICT(email) DO UPDATE SET
                   promo_opt_in = MAX(promo_opt_in, excluded.promo_opt_in)""",
            (email.lower(), int(promo_opt_in), source),
        )
        conn.commit()


def place_order(
    *,
    user_id: int | None,
    email: str,
    full_name: str | None,
    promo_opt_in: bool,
    items: list[OrderItemIn],
) -> OrderConfirmation:
    """Validate the cart against live stock, decrement it, and record the order.

    Raises StockProblem if any line can't be fulfilled; nothing is changed in that case.
    """
    with get_db() as conn:
        lines: list[OrderLine] = []
        problems: list[str] = []
        # Collapse duplicate (product, size) lines so quantities are checked together.
        wanted: dict[tuple[str, str], int] = {}
        for it in items:
            wanted[(it.product_id, it.size.upper())] = wanted.get(
                (it.product_id, it.size.upper()), 0
            ) + it.quantity

        for (product_id, size), qty in wanted.items():
            row = conn.execute(
                """SELECT c.name AS name, c.price AS price, i.quantity AS quantity
                   FROM catalogue c
                   JOIN inventory i ON i.product_id = c.product_id AND i.size = ?
                   WHERE c.product_id = ?""",
                (size, product_id),
            ).fetchone()
            if row is None:
                problems.append(f"We couldn't find {product_id} in size {size}.")
                continue
            if row["quantity"] < qty:
                have = row["quantity"]
                problems.append(
                    f"{row['name']} in size {size}: you asked for {qty} but "
                    f"{'only ' + str(have) + ' is' if have else 'none is'} in stock."
                )
                continue
            lines.append(
                OrderLine(
                    product_id=product_id,
                    name=row["name"],
                    size=size,
                    quantity=qty,
                    unit_price=row["price"],
                    line_total=round(row["price"] * qty, 2),
                )
            )

        if problems:
            raise StockProblem(problems)

        subtotal = round(sum(line.line_total for line in lines), 2)
        cursor = conn.execute(
            "INSERT INTO orders (user_id, email, subtotal, status) VALUES (?, ?, ?, 'confirmed')",
            (user_id, email.lower(), subtotal),
        )
        order_id = cursor.lastrowid
        for line in lines:
            # Decrement stock so the shop can't oversell.
            conn.execute(
                "UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND size = ?",
                (line.quantity, line.product_id, line.size),
            )
            conn.execute(
                """INSERT INTO order_items (order_id, product_id, size, quantity, unit_price)
                   VALUES (?, ?, ?, ?, ?)""",
                (order_id, line.product_id, line.size, line.quantity, line.unit_price),
            )
        created_at = conn.execute(
            "SELECT created_at FROM orders WHERE id = ?", (order_id,)
        ).fetchone()["created_at"]
        conn.commit()

    # Side effects after the order is safely committed.
    capture_contact(email, promo_opt_in, source="checkout")
    item_lines = "\n".join(f"  - {ln.quantity}x {ln.name} ({ln.size}) ${ln.line_total:.2f}" for ln in lines)
    _queue_email(
        email,
        f"Your Campus Customs order #{order_id} is confirmed",
        f"Thanks{' ' + full_name if full_name else ''}! We've received your order:\n"
        f"{item_lines}\nSubtotal: ${subtotal:.2f}\n\nBoola Boola!",
    )
    return OrderConfirmation(
        order_id=order_id,
        email=email.lower(),
        created_at=created_at,
        items=lines,
        subtotal=subtotal,
        message="Thanks for your order! A confirmation is on its way to your email.",
    )


def request_back_in_stock(req: NotifyRequest) -> str:
    """Record a back-in-stock request for a sold-out size and capture the email."""
    size = req.size.upper()
    with get_db() as conn:
        row = conn.execute(
            "SELECT c.name AS name, i.quantity AS quantity FROM catalogue c "
            "JOIN inventory i ON i.product_id = c.product_id AND i.size = ? WHERE c.product_id = ?",
            (size, req.product_id),
        ).fetchone()
        if row is None:
            raise StockProblem([f"We couldn't find {req.product_id} in size {size}."])
        name = row["name"]
        conn.execute(
            "INSERT INTO stock_notifications (email, product_id, size) VALUES (?, ?, ?)",
            (req.email.lower(), req.product_id, size),
        )
        conn.commit()

    capture_contact(req.email, promo_opt_in=False, source="back_in_stock")
    _queue_email(
        req.email,
        f"We'll let you know when the {name} ({size}) is back",
        f"You're on the list! We'll email you as soon as the {name} is restocked in size {size}.",
    )
    return f"Got it — we'll email you when the {name} is back in size {size}."
