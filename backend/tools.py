"""Data access for Campus Customs.

This module is the single source of product/stock data. The FastAPI product
routes use the plain loaders (`load_products`, `get_product_detail`), and the
agent calls the `*_tool` functions, which the same data but shaped for a
conversation and recorded so the chat route knows which cards to show.
"""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass, field
from pathlib import Path

from models import (
    Product,
    ProductCard,
    ProductDescription,
    ProductDetail,
    ProductPrice,
    ProductStock,
    ProductSummary,
    RelatedProduct,
    SizeStock,
    ToolError,
)

MAX_RECOMMENDATIONS = 3
MAX_SEARCH_RESULTS = 12  # cap on how many matches a single search returns

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "campus_customs.db"
DESCRIPTIONS_PATH = Path(__file__).resolve().parent / "customer_descriptions.json"

SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"]
LOW_STOCK_THRESHOLD = 5

CUSTOMER_DESCRIPTIONS: dict[str, str] = (
    json.loads(DESCRIPTIONS_PATH.read_text()) if DESCRIPTIONS_PATH.exists() else {}
)


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def category_for(garment_type: str) -> str:
    """Group the inconsistent garment_type labels into clean shop categories."""
    g = garment_type.lower()
    if "quarter-zip" in g:
        return "Quarter-Zips"
    if "jacket" in g:
        return "Jackets & Fleece"
    if "hood" in g:
        return "Hoodies"
    if "crewneck" in g or "sweatshirt" in g:
        return "Crewnecks & Sweatshirts"
    if "long-sleeve" in g:
        return "Long Sleeves"
    if "t-shirt" in g:
        return "T-Shirts"
    return "Other"


def stock_status(quantity: int) -> str:
    if quantity == 0:
        return "sold_out"
    if quantity <= LOW_STOCK_THRESHOLD:
        return "low_stock"
    return "in_stock"


def _product_from_row(row: sqlite3.Row, inventory: list[sqlite3.Row]) -> Product:
    sizes = sorted(inventory, key=lambda r: SIZE_ORDER.index(r["size"]))
    return Product(
        product_id=row["product_id"],
        name=row["name"],
        garment_type=row["garment_type"],
        category=category_for(row["garment_type"]),
        description=row["description"],
        customer_description=CUSTOMER_DESCRIPTIONS.get(row["product_id"], row["description"]),
        colors=json.loads(row["colors"]),
        search_tags=json.loads(row["search_tags"]),
        image_url=f"/media/{row['image_file_path']}",
        price=row["price"],
        inventory=[
            SizeStock(size=r["size"], quantity=r["quantity"], status=stock_status(r["quantity"]))
            for r in sizes
        ],
        total_stock=sum(r["quantity"] for r in sizes),
        sizes_available=[r["size"] for r in sizes if r["quantity"] > 0],
    )


def load_products(where: str = "", params: tuple = ()) -> list[Product]:
    with get_db() as conn:
        rows = conn.execute(f"SELECT * FROM catalogue {where} ORDER BY name", params).fetchall()
        inventory = conn.execute("SELECT product_id, size, quantity FROM inventory").fetchall()
    by_product: dict[str, list[sqlite3.Row]] = {}
    for inv in inventory:
        by_product.setdefault(inv["product_id"], []).append(inv)
    return [_product_from_row(r, by_product.get(r["product_id"], [])) for r in rows]


def get_product_detail(product_id: str) -> ProductDetail | None:
    products = load_products("WHERE product_id = ?", (product_id,))
    if not products:
        return None
    product = products[0]
    related = [
        RelatedProduct(
            product_id=p.product_id, name=p.name, image_url=p.image_url,
            price=p.price, total_stock=p.total_stock,
        )
        for p in load_products()
        if p.category == product.category and p.product_id != product_id
    ][:4]
    return ProductDetail(**product.model_dump(), related=related)


def get_products_by_ids(product_ids: list[str]) -> list[Product]:
    """Hydrate a list of ids into full Products, preserving the given order."""
    if not product_ids:
        return []
    found = {p.product_id: p for p in load_products()}
    return [found[pid] for pid in product_ids if pid in found]


# ---------- Agent deps and tools ----------

@dataclass
class AgentDeps:
    """Context passed to the agent for one chat turn.

    The customer identity fields are only set for signed-in users, so the agent
    knows who it's talking to. Guests leave them as None.
    """

    user_first_name: str | None = None
    user_full_name: str | None = None
    user_email: str | None = None
    focus_product_id: str | None = None  # product the customer is viewing, if any
    page_context: str | None = None  # short description of the page the customer is on
    run_id: str = ""  # ties this turn's audit-trail entries together
    # product_ids the tools surfaced this turn, so the route can fall back to them
    surfaced: list[str] = field(default_factory=list)


def _record(deps: AgentDeps, product_ids: list[str]) -> None:
    for pid in product_ids:
        if pid not in deps.surfaced:
            deps.surfaced.append(pid)


def search_products_tool(
    deps: AgentDeps,
    query: str = "",
    category: str | None = None,
    color: str | None = None,
    max_price: float | None = None,
) -> list[ProductSummary]:
    """Search the catalogue by free text, category, color, and/or price ceiling."""
    results: list[ProductSummary] = []
    q_words = query.lower().split()
    for p in load_products():
        if category and p.category.lower() != category.lower():
            continue
        if color and not any(color.lower() in c.lower() for c in p.colors):
            continue
        if max_price is not None and p.price > max_price:
            continue
        if q_words:
            haystack = " ".join(
                [p.name, p.garment_type, p.category, p.description, *p.colors, *p.search_tags]
            ).lower()
            if not all(w in haystack for w in q_words):
                continue
        results.append(
            ProductSummary(
                product_id=p.product_id, name=p.name, category=p.category, price=p.price,
                colors=p.colors, sizes_available=p.sizes_available, total_stock=p.total_stock,
            )
        )
    results.sort(key=lambda s: s.name)
    _record(deps, [s.product_id for s in results])
    return results[:MAX_SEARCH_RESULTS]


def find_product(product_id: str) -> Product | None:
    """Fetch one product by id (no side effects); used for context, not as a tool."""
    return next(iter(load_products("WHERE product_id = ?", (product_id,))), None)


def _recommendations(product: Product) -> list[ProductCard]:
    """A few in-stock items from the same category (for out-of-stock fallbacks)."""
    cards = [
        ProductCard.from_product(p)
        for p in load_products()
        if p.category == product.category
        and p.product_id != product.product_id
        and p.total_stock > 0
    ]
    return cards[:MAX_RECOMMENDATIONS]


def get_product_description_tool(
    deps: AgentDeps, product_id: str
) -> ProductDescription | ToolError:
    """Look up a product's description and design details from the catalogue."""
    product = find_product(product_id)
    if not product:
        return ToolError(error=f"No product found with id '{product_id}'.")
    _record(deps, [product.product_id])
    return ProductDescription(
        product_id=product.product_id,
        name=product.name,
        garment_type=product.garment_type,
        category=product.category,
        description=product.description,
        customer_description=product.customer_description,
        colors=product.colors,
    )


def get_product_price_tool(deps: AgentDeps, product_id: str) -> ProductPrice | ToolError:
    """Look up a product's exact price from the catalogue."""
    product = find_product(product_id)
    if not product:
        return ToolError(error=f"No product found with id '{product_id}'.")
    _record(deps, [product.product_id])
    return ProductPrice(product_id=product.product_id, name=product.name, price=product.price)


def get_product_stock_tool(deps: AgentDeps, product_id: str) -> ProductStock | ToolError:
    """Look up how many of a product are in stock, broken down by size, from inventory.

    If every size is sold out, `in_stock` is False and `recommendations` lists a few
    in-stock items from the same category.
    """
    product = find_product(product_id)
    if not product:
        return ToolError(error=f"No product found with id '{product_id}'.")
    _record(deps, [product.product_id])
    in_stock = product.total_stock > 0
    return ProductStock(
        product_id=product.product_id,
        name=product.name,
        total_stock=product.total_stock,
        in_stock=in_stock,
        sizes=product.inventory,
        sizes_available=product.sizes_available,
        recommendations=[] if in_stock else _recommendations(product),
    )
