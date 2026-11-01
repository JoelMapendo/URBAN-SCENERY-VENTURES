# URBAN-SCENERY-VENTURES

Full-stack AI-powered electronics marketplace combining a **FastAPI + SQLAlchemy 2.0 + Pydantic v2** backend with a **Vite + Tailwind CSS** multi-page storefront and Seller Central dashboard (`FrontEnd/`).

---

## Features

- **Electronics Product Catalog**: Live inventory sync between SQLite/PostgreSQL and both the Customer Storefront (`index.html`) and Seller Central (`seller.html`), with stock badges, search, category filtering, and multi-currency display (`UGX`, `USD`, `EUR`, `GBP`).
- **Checkout & Order Management**: Real-time stock validation, automated total calculation, express checkout modal (`POST /api/v1/orders`), guest order `#ID` lookup, authenticated order history, and Seller Central fulfillment progression (`PENDING` → `APPROVED` → `SHIPPED` → `DELIVERED`).
- **Payment Processing**: Multi-channel settlement (**Mobile Money**, **Bank Transfer**, **Crypto**) via `POST /api/v1/payments/pay` with instant receipt verification.
- **AI Electronics Assistant**:
  - Storefront AI Tech Advisor modal & smart search bar connected to `POST /api/v1/ai/recommend` and `GET /api/v1/ai/smart-search`.
  - Visual Search matcher connected to `GET /api/v1/ai/smart-search`.
  - Seller Central AI Product Uploader, Autonomous Dynamic Repricer, TikTok Shop simulator, and persisted AI interaction logs (`/api/v1/ai/interactions`).
- **Authentication & Role-Based Authorization**:
  - PBKDF2-HMAC-SHA256 password hashing and URL-safe JWT bearer tokens shared across Storefront and Seller Central (`urban:auth_session`).
  - Role hierarchy: `ADMIN`, `CUSTOMER`, and `GUEST`.

---

## Project Structure

```text
URBAN-SCENERY-VENTURES/
├── core/                     # Config, SQLAlchemy engine/session, JWT & RBAC security
├── models/                   # SQLAlchemy 2.0 ORM models (users, products, orders, payments, ai)
├── schemas/                  # Pydantic v2 request/response schemas
├── routers/                  # FastAPI /api/v1 routers (auth, users, products, orders, payments, ai, lookups)
├── services/                 # Business logic, stock checks, payment settlement, AI scoring
├── FrontEnd/                 # Vite + Tailwind CSS v3 frontend
│   ├── index.html            # Customer Storefront entry
│   ├── seller.html           # Seller Central & Admin Dashboard entry
│   ├── vite.config.js        # Dev (:5173) & preview (:4173) proxy -> FastAPI (:8000)
│   ├── nginx.conf            # Production Nginx config with /api/ & /health reverse proxy
│   └── src/
│       ├── services/api.js   # Unified FastAPI REST client & JWT session manager
│       ├── components/       # Checkout modal, Account/Orders modal, Cart, QuickView, VisualSearch
│       ├── main.js           # Storefront controller
│       └── seller.js         # Seller Central controller
├── main.py                   # FastAPI entry point (CORS + auto-seed on startup)
├── seed_data.py              # Idempotent seed for Admin, Customer, and sample electronics
├── test_backend.py           # End-to-end backend test suite
├── start_dev.sh              # One-command launcher for FastAPI + Vite dev servers
├── Dockerfile                # FastAPI backend container image
└── docker-compose.yml        # Full-stack Docker Compose (backend :8000 + frontend :8080)
```

---

## Quick Start (Local Development)

### Option A: Single-Command Launcher (macOS / Linux)

```bash
chmod +x start_dev.sh
./start_dev.sh
```

This creates `.venv` (Python 3.10+) if needed, installs backend and frontend dependencies, and starts:
- **Customer Storefront**: http://127.0.0.1:5173/
- **Seller Central Dashboard**: http://127.0.0.1:5173/seller.html
- **FastAPI Swagger UI**: http://127.0.0.1:8000/docs

### Option B: Run Backend & Frontend Separately

#### 1. Start the FastAPI Backend (`:8000`)

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

On startup (`AUTO_SEED=true`), the backend initializes lookup tables and seeds default accounts and sample electronics if missing:
- **Admin (Seller Central & Full CRUD)**: `admin@urbanventures.com` / `admin123`
- **Customer (Storefront Account)**: `customer@example.com` / `customer123`

#### 2. Start the Vite Frontend (`:5173`)

```bash
cd FrontEnd
npm install
npm run dev
```

Vite proxies `/api/*` and `/health` requests to `http://127.0.0.1:8000` (configurable via `VITE_BACKEND_URL` in `FrontEnd/.env`). If the frontend is opened on another static server, `src/services/api.js` automatically falls back to `http://127.0.0.1:8000/api/v1` via CORS.

---

## Docker Compose (Full Stack)

```bash
docker compose up --build
```

- **Frontend + Nginx API Proxy**: http://localhost:8080 (Storefront) and http://localhost:8080/seller.html (Seller Central)
- **FastAPI Backend**: http://localhost:8000/docs

---

## API Overview

| Domain | Endpoints |
| --- | --- |
| Auth | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/token`, `GET /api/v1/auth/me` |
| Users | `POST/GET /api/v1/users`, `GET/PUT/DELETE /api/v1/users/{public_id}`, `PATCH /api/v1/users/{public_id}/role` |
| Products | `POST/GET /api/v1/products`, `GET/PUT/DELETE /api/v1/products/{product_id}` |
| Orders | `POST/GET /api/v1/orders`, `GET/DELETE /api/v1/orders/{order_id}`, `PATCH /api/v1/orders/{order_id}/status` |
| Payments | `POST /api/v1/payments/pay`, `GET /api/v1/payments`, `GET/PUT/DELETE /api/v1/payments/{payment_id}`, `GET /api/v1/payments/order/{order_id}` |
| AI Assistant | `POST /api/v1/ai/recommend`, `GET /api/v1/ai/smart-search`, `POST/GET /api/v1/ai/interactions` |
| Lookups | `GET/POST /api/v1/lookups/{resource}`, `GET/PUT/DELETE /api/v1/lookups/{resource}/{lookup_id}` |

---

## Verification & Tests

```bash
# Run backend test suite
.venv/bin/python test_backend.py

# Build production frontend bundle
cd FrontEnd && npm run build
```
