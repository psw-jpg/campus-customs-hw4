# Campus Customs — Yale Bulldog Blue (MGT 409, Homework 4)

A customer-facing Yale merchandise website with an AI shopping assistant. Shoppers can browse
products, create an account, chat with an agent ("Handsome Dan") that gives **honest answers
about price and stock straight from the database**, see matching items appear on the page, add to
a cart, and check out.

- **Frontend:** React + Vite + TypeScript (`frontend/`)
- **Backend:** Python FastAPI + a PydanticAI agent (`backend/`)
- **Model:** `gpt-5.6-luna` via Portkey
- **Data:** SQLite (`data/campus_customs.db`) + product images (`data/products/`) — provided as a
  separate data pack (see below)

## Features

- Browse all products, filter by category, search, and sort.
- Single-product pages with customer-friendly copy, colors, per-size stock, and related items.
- Account sign-up and login (passwords stored only as salted PBKDF2 hashes).
- A floating chat assistant that:
  - answers questions about products, price, and stock using live database tools (never guesses);
  - dynamically updates the storefront with the products it finds;
  - remembers a signed-in customer's name and past conversation.
- Cart and checkout with real inventory decrement, plus "notify me when back in stock" and
  email capture.
- An append-only audit trail of agent activity (`outputs/audit_trail.json`).

## Project structure

```
hw4/
├── backend/                 FastAPI app + PydanticAI agent
│   ├── main.py              API routes (products, auth, chat, orders)
│   ├── agent.py             agent wiring (model, prompt, tools, loop limits)
│   ├── tools.py             data access + the agent's lookup tools
│   ├── models.py            Pydantic types shared across the app
│   ├── auth.py              password hashing + session tokens
│   ├── commerce.py          orders, inventory decrement, email capture
│   ├── audit.py             append-only audit trail
│   ├── prompts/prompts.md   the agent's system prompt (voice + safety rules)
│   └── requirements.txt
├── frontend/                React + Vite + TypeScript site
│   └── src/                 pages, components, contexts
├── outputs/                 harness.md, design.md, usability.md, app_check.html, audit_trail.json
├── data/                    << PLACE THE DATA PACK HERE (not included; see step 1)
├── requirements.txt         Python dependencies
├── .env.example             copy to .env and add your Portkey key
├── .gitignore
└── AI_prompts.md            log of the prompts used to build this project
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- A Portkey API key

## Setup

### 1. Add the data pack

This package does **not** include the database or product images. Place the provided data pack so
that these exist:

```
hw4/data/campus_customs.db
hw4/data/products/           (the product image .jpg files)
```

### 2. Add your API key

Copy the example env file and fill in your key:

```bash
cp .env.example .env
# then edit .env and set PORTKEY_API_KEY=...
```

### 3. Install dependencies

Python (from the `hw4/` folder):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Frontend (from `hw4/frontend/`):

```bash
npm install
```

## Running

Start the **backend** (from `hw4/backend/`, with the virtual environment activated):

```bash
source ../.venv/bin/activate
uvicorn main:app --reload --port 8000
```

Start the **frontend** in a second terminal (from `hw4/frontend/`):

```bash
npm run dev
```

Then open **http://localhost:5174**. The Vite dev server proxies `/api` and `/media` to the
backend on port 8000, so no extra configuration is needed. (If port 8000 is busy, run the backend
on another port and update the proxy target in `frontend/vite.config.ts`.)

## Test account

- **Email:** `test@campuscustoms.yale.edu`
- **Password:** `password`

*(This account lives in the data pack's database.)*

## Documentation

- `outputs/harness.md` — database schema, the agent, tools, safety rules, and specs.
- `outputs/design.md` — the visual design work and rationale.
- `outputs/usability.md` — the usability/business improvements.
- `outputs/app_check.html` — a self-contained live-test report with screenshots (double-click to open).
- `outputs/audit_trail.json` — append-only record of agent activity.
- `AI_prompts.md` — the full log of prompts used to build the project.

## Notes

- Secrets stay in `.env` (ignored by git); the real `.env` and the `data/` pack are not included.
- The chat assistant only reads data — it cannot change orders, accounts, or inventory.
