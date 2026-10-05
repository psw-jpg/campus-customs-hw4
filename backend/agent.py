"""PydanticAI agent wiring for the Campus Customs shopping assistant.

Uses gpt-5.6-luna through Portkey (the course default), the system prompt from
prompts/prompts.md, the tools in tools.py, and the structured output in models.py.
"""

from __future__ import annotations

import os
import uuid
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai.usage import UsageLimits

import audit
import tools
from models import (
    AgentReply,
    ChatMessage,
    Product,  # noqa: F401 — kept in scope so tool return-type hints resolve
    ProductCard,  # noqa: F401 — referenced by ProductStock's hints
    ProductDescription,
    ProductPrice,
    ProductStock,
    ProductSummary,
    ToolError,
)
from tools import AgentDeps

BASE_DIR = Path(__file__).resolve().parent
SYSTEM_PROMPT = (BASE_DIR / "prompts" / "prompts.md").read_text(encoding="utf-8")
MODEL_NAME = "gpt-5.6-luna"

# Loop limits: cap how long one chat turn can run so a prompt can't make the agent
# spin forever (runaway tool loops / cost). One turn may make at most this many model
# requests and this many tool calls.
RUN_LIMITS = UsageLimits(request_limit=10, tool_calls_limit=12)


def _build_model() -> OpenAIChatModel:
    load_dotenv(find_dotenv(usecwd=True))
    key = os.environ.get("PORTKEY_API_KEY")
    if not key:
        raise RuntimeError("PORTKEY_API_KEY is missing from .env")
    provider = OpenAIProvider(api_key=key, base_url="https://api.portkey.ai/v1")
    return OpenAIChatModel(MODEL_NAME, provider=provider)


agent: Agent[AgentDeps, AgentReply] = Agent(
    _build_model(),
    deps_type=AgentDeps,
    output_type=AgentReply,
    instructions=SYSTEM_PROMPT,
)


@agent.instructions
def _context(ctx: RunContext[AgentDeps]) -> str:
    """Per-turn context added to the system instructions.

    Tells the agent who it's talking to (for signed-in customers) and what page
    the customer is on, so follow-up questions like "is this in my size?" make sense.
    """
    lines: list[str] = []

    # Who is chatting.
    if ctx.deps.user_first_name:
        name = ctx.deps.user_full_name or ctx.deps.user_first_name
        email = f" (email: {ctx.deps.user_email})" if ctx.deps.user_email else ""
        lines.append(
            f"The customer is signed in: {name}{email}. You may greet them by their first "
            f"name, {ctx.deps.user_first_name}, when it feels natural. Their saved chat history "
            "is included above, so you can remember past conversations."
        )
    else:
        lines.append("The customer is browsing as a guest (not signed in).")

    # Where they are on the site.
    if ctx.deps.page_context:
        lines.append(f"Right now the customer is on: {ctx.deps.page_context}.")
    if ctx.deps.focus_product_id:
        product = tools.find_product(ctx.deps.focus_product_id)
        if product:
            lines.append(
                f"They are viewing the '{product.name}' product page "
                f"(product_id: {product.product_id}), so a question like 'is this in stock?' or "
                "'how much is it?' is probably about this item."
            )
    return "\n".join(lines)


def _audit(run_id: str, tool: str, detail: str, exc: Exception | None = None) -> None:
    audit.append_entry(tool, detail, f"error: {type(exc).__name__}" if exc else "ok", run_id)


@agent.tool
def search_products(
    ctx: RunContext[AgentDeps],
    query: str = "",
    category: str | None = None,
    color: str | None = None,
    max_price: float | None = None,
) -> list[ProductSummary]:
    """Search the catalogue.

    Args:
        query: free text to match against name, description, tags, colors (e.g. "bulldog hoodie").
        category: one of Hoodies, Crewnecks & Sweatshirts, T-Shirts, Quarter-Zips,
            Jackets & Fleece, Long Sleeves.
        color: a color to require (e.g. "navy").
        max_price: only return items at or below this price.
    """
    try:
        res = tools.search_products_tool(ctx.deps, query, category, color, max_price)
        _audit(
            ctx.deps.run_id, "search_products",
            f"query={query!r} category={category} color={color} max_price={max_price} "
            f"-> {len(res)} matches",
        )
        return res
    except Exception as e:
        _audit(ctx.deps.run_id, "search_products", f"query={query!r}", e)
        raise


@agent.tool
def get_product_description(
    ctx: RunContext[AgentDeps], product_id: str
) -> ProductDescription | ToolError:
    """Look up a product's description, garment type, and colors from the catalogue.

    Use this for "what is this?", "what does it look like?", or "does it have a bulldog on
    it?" style questions. `product_id` comes from `search_products`.
    """
    try:
        res = tools.get_product_description_tool(ctx.deps, product_id)
        summary = res.error if isinstance(res, ToolError) else f"{res.name} ({res.garment_type})"
        _audit(ctx.deps.run_id, "get_product_description", f"product_id={product_id} -> {summary}")
        return res
    except Exception as e:
        _audit(ctx.deps.run_id, "get_product_description", f"product_id={product_id}", e)
        raise


@agent.tool
def get_product_price(ctx: RunContext[AgentDeps], product_id: str) -> ProductPrice | ToolError:
    """Look up a product's exact price from the catalogue. Use this for any price question."""
    try:
        res = tools.get_product_price_tool(ctx.deps, product_id)
        summary = res.error if isinstance(res, ToolError) else f"{res.name} = ${res.price:.2f}"
        _audit(ctx.deps.run_id, "get_product_price", f"product_id={product_id} -> {summary}")
        return res
    except Exception as e:
        _audit(ctx.deps.run_id, "get_product_price", f"product_id={product_id}", e)
        raise


@agent.tool
def get_product_stock(ctx: RunContext[AgentDeps], product_id: str) -> ProductStock | ToolError:
    """Look up how many of a product are in stock, in total and per size, from inventory.

    Use this for "is this in stock?", "do you have it in L?", or "how many are left?". If the
    item is fully sold out, the result's `recommendations` lists in-stock alternatives to offer.
    """
    try:
        res = tools.get_product_stock_tool(ctx.deps, product_id)
        summary = (
            res.error if isinstance(res, ToolError)
            else f"{res.name}: {res.total_stock} total, in_stock={res.in_stock}"
        )
        _audit(ctx.deps.run_id, "get_product_stock", f"product_id={product_id} -> {summary}")
        return res
    except Exception as e:
        _audit(ctx.deps.run_id, "get_product_stock", f"product_id={product_id}", e)
        raise


def _to_model_messages(history: list[ChatMessage]):
    """Convert stored chat turns into PydanticAI message history."""
    from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, UserPromptPart

    messages = []
    for m in history:
        if m.role == "user":
            messages.append(ModelRequest(parts=[UserPromptPart(content=m.content)]))
        elif m.role == "assistant":
            messages.append(ModelResponse(parts=[TextPart(content=m.content)]))
    return messages


async def run_agent(
    message: str,
    *,
    user_first_name: str | None = None,
    user_full_name: str | None = None,
    user_email: str | None = None,
    focus_product_id: str | None = None,
    page_context: str | None = None,
    history: list[ChatMessage] | None = None,
) -> tuple[AgentReply, list[str]]:
    """Run one chat turn. Returns the structured reply and the ids surfaced by tools."""
    run_id = uuid.uuid4().hex[:12]
    deps = AgentDeps(
        user_first_name=user_first_name,
        user_full_name=user_full_name,
        user_email=user_email,
        focus_product_id=focus_product_id,
        page_context=page_context,
        run_id=run_id,
    )
    who = "signed-in" if user_first_name else "guest"
    audit.append_entry("agent_run", f"{who} message: {message[:120]!r}", "started", run_id)
    try:
        result = await agent.run(
            message,
            deps=deps,
            message_history=_to_model_messages(history or []),
            usage_limits=RUN_LIMITS,
        )
    except Exception as e:
        audit.append_entry("agent_run", f"message: {message[:80]!r}", f"error: {type(e).__name__}", run_id)
        raise
    out = result.output
    audit.append_entry(
        "agent_run",
        f"reply: {out.reply[:120]!r}; cards={out.product_ids or deps.surfaced}",
        "completed",
        run_id,
    )
    return out, deps.surfaced
