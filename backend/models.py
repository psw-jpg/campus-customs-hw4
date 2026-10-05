"""Structured types shared across the backend and the agent."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator

# ---------- Products ----------

StockStatus = str  # "in_stock" | "low_stock" | "sold_out"


class SizeStock(BaseModel):
    size: str
    quantity: int
    status: StockStatus


class Product(BaseModel):
    product_id: str
    name: str
    garment_type: str
    category: str
    description: str
    customer_description: str
    colors: list[str]
    search_tags: list[str]
    image_url: str
    price: float
    inventory: list[SizeStock]
    total_stock: int
    sizes_available: list[str]


class RelatedProduct(BaseModel):
    product_id: str
    name: str
    image_url: str
    price: float
    total_stock: int


class ProductDetail(Product):
    related: list[RelatedProduct] = []


# ---------- Agent I/O ----------

class ProductSummary(BaseModel):
    """Compact product info handed to the agent by its search tool."""

    product_id: str
    name: str
    category: str
    price: float
    colors: list[str]
    sizes_available: list[str]
    total_stock: int


class ProductDescription(BaseModel):
    """What the `get_product_description` tool returns (all from the catalogue)."""

    product_id: str
    name: str
    garment_type: str
    category: str
    description: str  # the factual catalogue description
    customer_description: str  # the friendlier rewrite shown on the site
    colors: list[str]


class ProductPrice(BaseModel):
    """What the `get_product_price` tool returns (all from the catalogue)."""

    product_id: str
    name: str
    price: float


class ProductStock(BaseModel):
    """What the `get_product_stock` tool returns (all from the inventory table).

    `in_stock` is False only when every size is sold out. When that happens,
    `recommendations` holds a few in-stock items from the same category.
    """

    product_id: str
    name: str
    total_stock: int
    in_stock: bool
    sizes: list[SizeStock]  # every size with its quantity and status
    sizes_available: list[str]  # just the sizes a customer could buy right now
    recommendations: list["ProductCard"] = []


class ToolError(BaseModel):
    """Returned by a lookup tool when no product matches the given id."""

    error: str


class AgentReply(BaseModel):
    """The agent's structured answer.

    `reply` is the chat text. `product_ids` are the catalogue items the agent
    chose to show as cards; the backend turns them into real cards so the
    cards always match actual database rows.
    """

    reply: str
    product_ids: list[str] = []


class ProductCard(BaseModel):
    """Compact product info the chat panel renders as a clickable card.

    This is everything the card needs and nothing more, so chat replies stay
    small. Built from a full Product by `ProductCard.from_product`.
    """

    product_id: str
    name: str
    category: str
    price: float
    image_url: str
    total_stock: int
    sizes_available: list[str]

    @classmethod
    def from_product(cls, product: "Product") -> "ProductCard":
        return cls(
            product_id=product.product_id,
            name=product.name,
            category=product.category,
            price=product.price,
            image_url=product.image_url,
            total_stock=product.total_stock,
            sizes_available=product.sizes_available,
        )


# ---------- Chat API ----------

class ChatMessage(BaseModel):
    """One turn of conversation (used for history in and out)."""

    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    """What the website sends to start or continue a chat turn."""

    message: str
    product_id: str | None = None  # the product the customer is viewing, if any
    page_context: str | None = None  # a short description of the page the customer is on
    history: list[ChatMessage] = []  # prior turns from the current browser session (guests)


class ChatResponse(BaseModel):
    """What the chat route returns: the agent's text plus any cards to show."""

    reply: str
    products: list[ProductCard] = []


class ChatHistoryMessage(BaseModel):
    """One saved message replayed when a logged-in customer returns."""

    role: str  # "user" | "assistant"
    content: str
    products: list[ProductCard] = []  # cards shown with that message, if any


# ---------- Auth ----------

class SignUpRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    promo_opt_in: bool = False

    @field_validator("first_name", "last_name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name fields can't be empty")
        return v.strip()

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PublicUser(BaseModel):
    id: int
    first_name: str | None
    last_name: str | None
    email: str
    promo_opt_in: bool


class AuthResponse(BaseModel):
    token: str
    user: PublicUser


# ---------- Cart, checkout, and orders ----------

class OrderItemIn(BaseModel):
    """One line a customer wants to buy."""

    product_id: str
    size: str
    quantity: int = Field(ge=1, le=25)


class OrderRequest(BaseModel):
    """A checkout submission from the cart."""

    items: list[OrderItemIn]
    email: EmailStr | None = None  # required for guests; taken from the account otherwise
    full_name: str | None = None
    promo_opt_in: bool = False

    @field_validator("items")
    @classmethod
    def not_empty(cls, v: list[OrderItemIn]) -> list[OrderItemIn]:
        if not v:
            raise ValueError("Your cart is empty.")
        return v


class OrderLine(BaseModel):
    product_id: str
    name: str
    size: str
    quantity: int
    unit_price: float
    line_total: float


class OrderConfirmation(BaseModel):
    order_id: int
    email: str
    created_at: str
    items: list[OrderLine]
    subtotal: float
    message: str


class NotifyRequest(BaseModel):
    """A 'tell me when this is back in stock' request for a sold-out size."""

    product_id: str
    size: str
    email: EmailStr


class SimpleMessage(BaseModel):
    message: str


# ProductStock references ProductCard, which is defined after it; resolve that now.
ProductStock.model_rebuild()
