"""Campus Customs backend — products, images, authentication, and the agent chat route.

Run from the homework/4 folder:
    .venv/bin/uvicorn backend.main:app --port 8001 --reload
"""

import json
import sqlite3

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import auth
import commerce
import tools
from agent import run_agent
from models import (
    AuthResponse,
    ChatHistoryMessage,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    LoginRequest,
    NotifyRequest,
    OrderConfirmation,
    OrderRequest,
    ProductCard,
    ProductDetail,
    Product,
    PublicUser,
    SignUpRequest,
    SimpleMessage,
)
from tools import DATA_DIR, get_db

app = FastAPI(title="Campus Customs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Product photos: catalogue.image_file_path is "products/<file>.jpg", relative to data/.
app.mount("/media", StaticFiles(directory=DATA_DIR), name="media")

# Make sure the orders / notifications / marketing tables exist.
commerce.init_db()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


# ---------- Products ----------

@app.get("/api/products", response_model=list[Product])
def list_products() -> list[Product]:
    return tools.load_products()


@app.get("/api/products/{product_id}", response_model=ProductDetail)
def get_product(product_id: str) -> ProductDetail:
    detail = tools.get_product_detail(product_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return detail


# ---------- Authentication ----------

def public_user(row: sqlite3.Row) -> PublicUser:
    # Note: password_hash is deliberately never included here.
    return PublicUser(
        id=row["id"],
        first_name=row["first_name"],
        last_name=row["last_name"],
        email=row["email"],
        promo_opt_in=bool(row["promo_opt_in"]),
    )


def current_user(authorization: str | None = Header(default=None)) -> sqlite3.Row:
    """Resolve the logged-in user from the Bearer token, or raise 401."""
    token = authorization.removeprefix("Bearer ").strip() if authorization else ""
    user_id = auth.verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Not signed in")
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Account not found")
    return row


def optional_user(authorization: str | None = Header(default=None)) -> sqlite3.Row | None:
    """Like current_user, but returns None for guests instead of raising."""
    try:
        return current_user(authorization)
    except HTTPException:
        return None


@app.post("/api/auth/signup", response_model=AuthResponse, status_code=201)
def signup(request: SignUpRequest) -> AuthResponse:
    email = request.email.lower()
    with get_db() as conn:
        if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            raise HTTPException(status_code=409, detail="That email is already registered")
        cursor = conn.execute(
            """INSERT INTO users (name, email, password_hash, first_name, last_name, promo_opt_in)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                f"{request.first_name} {request.last_name}",
                email,
                auth.hash_password(request.password),  # hashed, never the raw password
                request.first_name,
                request.last_name,
                int(request.promo_opt_in),
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return AuthResponse(token=auth.create_token(row["id"]), user=public_user(row))


@app.post("/api/auth/login", response_model=AuthResponse)
def login(request: LoginRequest) -> AuthResponse:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (request.email.lower(),)).fetchone()
    # Same error whether the email is unknown or the password is wrong, so attackers
    # can't tell which emails exist.
    if row is None or not auth.verify_password(request.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return AuthResponse(token=auth.create_token(row["id"]), user=public_user(row))


@app.get("/api/auth/me", response_model=PublicUser)
def me(user: sqlite3.Row = Depends(current_user)) -> PublicUser:
    return public_user(user)


# ---------- Chat ----------

RECENT_HISTORY_LIMIT = 10


def load_recent_history(user_id: int) -> list[ChatMessage]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT ?",
            (user_id, RECENT_HISTORY_LIMIT),
        ).fetchall()
    return [ChatMessage(role=r["role"], content=r["content"]) for r in reversed(rows)]


def save_message(user_id: int, role: str, content: str, products: list[Product]) -> None:
    products_json = json.dumps([p.model_dump() for p in products]) if products else None
    with get_db() as conn:
        conn.execute(
            "INSERT INTO chat_messages (user_id, role, content, products_json) VALUES (?, ?, ?, ?)",
            (user_id, role, content, products_json),
        )
        conn.commit()


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user: sqlite3.Row | None = Depends(optional_user)) -> ChatResponse:
    # Logged-in users get their saved history and identity; guests stay anonymous and
    # send their session history in the request.
    history = load_recent_history(user["id"]) if user else request.history

    try:
        reply, surfaced = await run_agent(
            request.message,
            user_first_name=user["first_name"] if user else None,
            user_full_name=user["name"] if user else None,
            user_email=user["email"] if user else None,
            focus_product_id=request.product_id,
            page_context=request.page_context,
            history=history,
        )
    except Exception:
        # Don't leak internals or 500 on a model/filter/timeout error — reply gracefully.
        return ChatResponse(
            reply=(
                "Sorry, I had trouble with that one. Could you rephrase it, or ask me about "
                "our Yale hoodies, crewnecks, tees, quarter-zips, or jackets?"
            )
        )

    # Show the cards the agent chose; fall back to what its tools surfaced.
    product_ids = reply.product_ids or surfaced
    products = tools.get_products_by_ids(product_ids)
    cards = [ProductCard.from_product(p) for p in products]

    if user:
        save_message(user["id"], "user", request.message, [])
        save_message(user["id"], "assistant", reply.reply, products)

    return ChatResponse(reply=reply.reply, products=cards)


@app.get("/api/chat/history", response_model=list[ChatHistoryMessage])
def chat_history(user: sqlite3.Row = Depends(current_user)) -> list[ChatHistoryMessage]:
    """Return the signed-in customer's full saved conversation, oldest first.

    Each saved assistant message may carry the product cards shown with it, so the
    panel can rebuild the conversation exactly as it looked.
    """
    with get_db() as conn:
        rows = conn.execute(
            "SELECT role, content, products_json FROM chat_messages WHERE user_id = ? ORDER BY id",
            (user["id"],),
        ).fetchall()

    messages: list[ChatHistoryMessage] = []
    for row in rows:
        cards: list[ProductCard] = []
        if row["products_json"]:
            # Rebuild cards from the current catalogue by id, so they're valid and up to
            # date regardless of how the snapshot was stored. Products that no longer
            # exist are simply dropped.
            saved = json.loads(row["products_json"])
            ids = [item["product_id"] for item in saved if "product_id" in item]
            cards = [ProductCard.from_product(p) for p in tools.get_products_by_ids(ids)]
        messages.append(ChatHistoryMessage(role=row["role"], content=row["content"], products=cards))
    return messages


# ---------- Cart checkout, orders, and back-in-stock ----------

@app.post("/api/orders", response_model=OrderConfirmation, status_code=201)
def create_order(
    request: OrderRequest, user: sqlite3.Row | None = Depends(optional_user)
) -> OrderConfirmation:
    """Place an order: validate the cart against live stock, then decrement and record it.

    Works for guests (who must supply an email) and signed-in customers (email from account).
    """
    email = user["email"] if user else request.email
    if not email:
        raise HTTPException(status_code=422, detail="An email address is required to check out.")
    full_name = user["name"] if user else request.full_name
    try:
        return commerce.place_order(
            user_id=user["id"] if user else None,
            email=email,
            full_name=full_name,
            promo_opt_in=request.promo_opt_in,
            items=request.items,
        )
    except commerce.StockProblem as exc:
        # 409 Conflict: the cart no longer matches available stock.
        raise HTTPException(status_code=409, detail=exc.problems) from exc


@app.get("/api/orders", response_model=list[OrderConfirmation])
def list_orders(user: sqlite3.Row = Depends(current_user)) -> list[OrderConfirmation]:
    """A signed-in customer's past orders, newest first."""
    with get_db() as conn:
        orders = conn.execute(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", (user["id"],)
        ).fetchall()
        confirmations: list[OrderConfirmation] = []
        for o in orders:
            items = conn.execute(
                """SELECT oi.product_id, oi.size, oi.quantity, oi.unit_price, c.name AS name
                   FROM order_items oi JOIN catalogue c ON c.product_id = oi.product_id
                   WHERE oi.order_id = ?""",
                (o["id"],),
            ).fetchall()
            confirmations.append(
                OrderConfirmation(
                    order_id=o["id"],
                    email=o["email"],
                    created_at=o["created_at"],
                    subtotal=o["subtotal"],
                    items=[
                        {
                            "product_id": it["product_id"],
                            "name": it["name"],
                            "size": it["size"],
                            "quantity": it["quantity"],
                            "unit_price": it["unit_price"],
                            "line_total": round(it["unit_price"] * it["quantity"], 2),
                        }
                        for it in items
                    ],
                    message="",
                )
            )
    return confirmations


@app.post("/api/notify-me", response_model=SimpleMessage, status_code=201)
def notify_me(request: NotifyRequest) -> SimpleMessage:
    """Sign up to be emailed when a sold-out size is back in stock."""
    try:
        return SimpleMessage(message=commerce.request_back_in_stock(request))
    except commerce.StockProblem as exc:
        raise HTTPException(status_code=404, detail=exc.problems) from exc
