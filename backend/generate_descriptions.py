"""One-time script: rewrite each catalogue description as short, customer-friendly copy.

Saves backend/customer_descriptions.json, which main.py serves on product pages.
Run from the homework/4 folder:
    .venv/bin/python backend/generate_descriptions.py
"""

import json
import os
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

BACKEND_DIR = Path(__file__).resolve().parent
DB_PATH = BACKEND_DIR.parent / "data" / "campus_customs.db"
OUTPUT_PATH = BACKEND_DIR / "customer_descriptions.json"

load_dotenv(find_dotenv(usecwd=True))  # finds the repository-root .env

client = OpenAI(
    api_key=os.environ["PORTKEY_API_KEY"],
    base_url="https://api.portkey.ai/v1",
    default_headers={"x-portkey-provider": "openai"},
)

PROMPT = """You write product copy for Campus Customs, a Yale merchandise shop in New Haven.
Rewrite the catalogue description below into 2-3 warm, upbeat sentences for a shopper.

Rules:
- Use ONLY facts in the catalogue description. Do not invent materials, fabric weight, fit,
  care instructions, discounts, or availability.
- Do not mention price or stock.
- Plain text, no headings, no bullet points, no quotation marks around the answer.

Product name: {name}
Garment type: {garment_type}
Catalogue description: {description}"""


def rewrite(row: sqlite3.Row) -> tuple[str, str]:
    response = client.chat.completions.create(
        model="gpt-5.6-luna",
        messages=[{"role": "user", "content": PROMPT.format(**dict(row))}],
        max_completion_tokens=400,
    )
    return row["product_id"], response.choices[0].message.content.strip()


def main() -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT product_id, name, garment_type, description FROM catalogue").fetchall()

    existing = json.loads(OUTPUT_PATH.read_text()) if OUTPUT_PATH.exists() else {}
    todo = [r for r in rows if r["product_id"] not in existing]
    print(f"{len(existing)} already done, generating {len(todo)}...")

    with ThreadPoolExecutor(max_workers=8) as pool:
        for product_id, text in pool.map(rewrite, todo):
            if text:
                existing[product_id] = text

    OUTPUT_PATH.write_text(json.dumps(existing, indent=2, sort_keys=True))
    print(f"Saved {len(existing)} descriptions to {OUTPUT_PATH.name}")


if __name__ == "__main__":
    main()
