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
- **100% Free Open-Source AI Photo-Editing Studio**:
  - Built directly into the Seller Portal (**AI Photo Studio** tab & **Upload Electronics** flow) with zero paid API dependencies (`rembg`, `opencv-python-headless`, `Pillow`, `numpy`, `onnxruntime` + browser CV fallback).
  - **10 Integrated Editing Tools**:
    1. **Background Removal (`remove_bg`)**: Salient-object alpha segmentation (`rembg` U2Net ONNX + OpenCV GrabCut) with feathering and alpha threshold control.
    2. **Background Replacement (`replace_bg`)**: Studio Clean White, 3D Brushed Tech Podium, Urban Cyber Neon, Flagship Glass Reflection, Warm Sandstone, Solid Custom Color, or Custom Uploaded Backdrop with contact drop shadows and bokeh depth blur.
    3. **Image Enhancement (`enhance`)**: LAB-space CLAHE adaptive contrast, shadow recovery, brightness, contrast, vibrance, and warmth tuning.
    4. **Image Sharpening (`sharpen`)**: Edge-aware Gaussian Unsharp Masking and OpenCV high-frequency structure detail boost.
    5. **Image Resizing (`resize`)**: High-precision Lanczos resampling with aspect-ratio lock, smart padding, and 1-click e-commerce presets (`1000×1000`, `1200×900`, `1920×1080`, `1080×1350`).
    6. **Image Cropping (`crop`)**: Lossless region cropping with interactive selection coordinates and aspect-ratio presets (`1:1`, `4:3`, `16:9`, `4:5`, `Free`).
    7. **Object Removal (`remove_object`)**: Interactive brush mask canvas on the frontend paired with OpenCV Fast Marching (`INPAINT_TELEA`) and Navier-Stokes (`INPAINT_NS`) texture inpainting.
    8. **Image Restoration (`restore`)**: Non-Local Means colored denoising (`fastNlMeansDenoisingColored`), morphological dust/scratch repair, Gray-World color cast neutralization, and faded contrast recovery.
    9. **Portrait Enhancement (`portrait_enhance`)**: YCrCb skin-tone detection with edge-preserving bilateral skin smoothing, eye/hair detail sharpening, and studio fill-light lift.
    10. **AI Scene Generator (`generate_scene`)**: Free procedural studio lighting & bokeh scene synthesis with optional foreground product compositing.
  - **Workspace Features**: Drag-and-drop upload (up to 10 MB, JPEG/PNG/WebP validated), natural-language AI command bar, interactive Before/After split slider, multi-step Undo/Redo editing history timeline, and 1-click download (PNG/JPEG/WebP) or direct application to product listings.
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
| AI Photo Studio | `GET /api/v1/ai/photo-studio/capabilities`, `POST /api/v1/ai/photo-studio/process`, `POST /api/v1/ai/photo-studio/assist` |
| Lookups | `GET/POST /api/v1/lookups/{resource}`, `GET/PUT/DELETE /api/v1/lookups/{resource}/{lookup_id}` |

---

## Verification & Tests

```bash
# Run backend test suite
.venv/bin/python test_backend.py

# Build production frontend bundle
cd FrontEnd && npm run build
```
