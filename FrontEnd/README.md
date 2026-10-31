# Urban Scenery Ventures — AI-Powered Metropolitan E-Commerce & Merchant Hub

A modern, responsive e-commerce storefront and AI seller platform built with **Vite**, **Tailwind CSS v3**, and **vanilla JavaScript**. Features curated boutique shops, physical retail store locators with 2-hour pickup, image-based visual search, an AI-powered Seller Central portal, 1-click AI listing generation, dynamic repricing algorithms, and autonomous customer support agents.

---

## 🌐 Pages & Modules
- **Customer Storefront (`/index.html`)**: Interactive catalog, visual camera search, physical store pickup selector, slide-out cart drawer, and 15% welcome promo pop-up.
- **Seller Central & Admin Dashboard (`/seller.html`)**: Onboarding landing page, merchant sign-in/up, KPI performance HUD, AI Product Creator (auto-generates copy, bullet specs, and pricing), inventory management table with live AI repricing, and an AI Agent Command Center.
- **TikTok API Architecture**: Complete guide and integration architecture documented in [`TIKTOK_API_GUIDE.md`](./TIKTOK_API_GUIDE.md).

---

## 🚀 Running with Docker

### Option 1: Docker Compose (Production - Recommended)
Compiles all dependencies inside Docker and serves via a hardened, high-performance Alpine Nginx server on port **8080**:

```bash
docker compose up --build
```

Access at: `http://localhost:8080` (Storefront) and `http://localhost:8080/seller.html` (Seller Central)

### Option 2: Direct Docker CLI
```bash
# Build the production image (compiles dependencies in builder stage)
docker build -t urban-scenery-ventures .

# Run the container
docker run -d -p 8080:80 --name urban-scenery-ventures urban-scenery-ventures
```

### Option 3: Docker Development Mode (Hot-Reload)
```bash
docker compose --profile dev up --build storefront-dev
```
Access at: `http://localhost:5173`

---

## 💻 Running Locally (Without Docker)

### 1. Start Development Server
```bash
npm install
npm run dev
```

### 2. Compile Production Bundle
```bash
npm run build
```
Compiled output will be placed in the `dist/` directory.

### 3. Preview Production Build
```bash
npm run preview
```
