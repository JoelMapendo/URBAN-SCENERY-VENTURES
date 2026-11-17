# URBAN SCENERY VENTURES — Complete API Keys & Backend Reference

> [!IMPORTANT]
> **100% Zero-Cost Open-Source Architecture**: All 10 AI Photo-Editing Studio tools (`rembg`, `OpenCV`, `Pillow`, `NumPy`, `ONNX Runtime`) run locally inside the FastAPI backend without any paid third-party subscriptions.

---

## 1. Backend Environment Keys (`.env`)

Copy and save the block below as `.env` in the root backend folder:

```env
# ==========================================================
# URBAN SCENERY VENTURES — BACKEND ENVIRONMENT & API KEYS
# ==========================================================

# 1. Database Configuration (SQLite default or PostgreSQL)
DATABASE_URL=sqlite:///./urban_ventures.db

# 2. JWT Token Signing Secret Key
SECRET_KEY=urbanventures-super-secret-jwt-key-2026-change-in-prod
# Alternative 256-bit production secret key:
# SECRET_KEY=usv_jwt_4wBATu6I0ouQqrg0k9qvouy44fOpEjp4NW3rJO753fI
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# 3. AI Photo Studio Service API Keys (Validated via 'X-Studio-Key' header)
STUDIO_API_KEY=usv_studio_live_e0af0363507ed365c2d84b45e747a678629f4662c99e2a78
STUDIO_DEV_KEY=usv_studio_dev_fc1674f0481e7e3bf539f655856f4ce726cf794f8bf0448e
REQUIRE_STUDIO_API_KEY=false

# 4. Webhook Signing Secret
WEBHOOK_SECRET=usv_whsec_bf2a34edc008b1a665cfa9d3876766bf28fc6cc1

# 5. Optional Free-Tier Gemini Text Prompt Assistant (Leave empty for 100% local engine)
GEMINI_API_KEY=

AUTO_SEED=true
ENVIRONMENT=development
```

---

## 2. Frontend Environment Keys (`FrontEnd/.env`)

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_STUDIO_API_KEY=usv_studio_live_e0af0363507ed365c2d84b45e747a678629f4662c99e2a78
```

---

## 3. Pre-Generated Admin / Seller Credentials & JWT Bearer Token

| Field | Value |
| :--- | :--- |
| **Admin Email** | `admin@urbanventures.com` |
| **Admin Password** | `admin123` |
| **Customer Email** | `customer@example.com` |
| **Customer Password** | `customer123` |
| **Admin Public UUID** | `a8e6fe51-072e-4bd4-b62d-d03f52111195` |
| **Studio Production Key (`X-Studio-Key`)** | `usv_studio_live_e0af0363507ed365c2d84b45e747a678629f4662c99e2a78` |
| **Studio Dev Key (`X-Studio-Key`)** | `usv_studio_dev_fc1674f0481e7e3bf539f655856f4ce726cf794f8bf0448e` |

### 30-Day Pre-Signed Admin Bearer Token (`Authorization: Bearer <token>`)
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhOGU2ZmU1MS0wNzJlLTRiZDQtYjYyZC1kMDNmNTIxMTExOTUiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE3OTc0NTk0ODIsImlhdCI6MTc5NDg2NzQ4Mn0.AMhtz6tPOzlGcCLTQV8GoA4JEyWNNwDmUC-fG7UO5Bw
```

---

## 4. Complete REST API Endpoints Reference (`Base URL: http://127.0.0.1:8000`)

### A. Free Open-Source AI Photo-Editing Studio (`/api/v1/ai/photo-studio`)
Required Header (when `REQUIRE_STUDIO_API_KEY=true`):
`X-Studio-Key: usv_studio_live_e0af0363507ed365c2d84b45e747a678629f4662c99e2a78`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/ai/photo-studio/capabilities` | Lists all 10 available free photo-editing tools and engine readiness (`rembg`, `OpenCV`, `Pillow`). |
| `POST` | `/api/v1/ai/photo-studio/process` | Executes any of the 10 photo-editing tools on a Base64/Data-URL image (`<= 10 MB`, `JPEG`/`PNG`/`WebP`). |
| `POST` | `/api/v1/ai/photo-studio/assist` | Converts a natural-language prompt into recommended tool + parameters. |

#### Supported `tool` Values & `params` for `POST /api/v1/ai/photo-studio/process`:
1. **`remove_bg`**: `{"feather": 1, "threshold": 0, "alpha_matting": false}`
2. **`replace_bg`**: `{"preset": "studio_white" | "tech_podium" | "cyber_neon" | "flagship_glass" | "warm_editorial" | "solid_color", "bg_color": "#F8FAFC", "add_shadow": true, "scale": 0.78, "bg_blur": 0}` (Optional `custom_bg_base64`)
3. **`enhance`**: `{"brightness": 1.04, "contrast": 1.15, "saturation": 1.12, "warmth": 5, "shadows": 15, "auto_clahe": true}`
4. **`sharpen`**: `{"strength": 65, "radius": 2.0, "detail_boost": true}`
5. **`resize`**: `{"width": 1000, "height": 1000, "maintain_aspect": true, "fit_mode": "pad" | "contain" | "cover" | "stretch", "pad_color": "#FFFFFF"}`
6. **`crop`**: `{"aspect_preset": "1:1" | "4:3" | "16:9" | "4:5"}` OR `{"norm_x": 0.1, "norm_y": 0.1, "norm_w": 0.8, "norm_h": 0.8}`
7. **`remove_object`**: `{"method": "telea" | "ns", "radius": 7}` + `mask_base64` (painted mask Data URL)
8. **`restore`**: `{"denoise_strength": 12, "remove_scratches": true, "restore_contrast": true, "color_correct": true}`
9. **`portrait_enhance`**: `{"skin_smooth": 60, "eye_sharpen": 50, "warmth": 10, "brightness": 8}`
10. **`generate_scene`**: `{"prompt": "Luxury neon podium", "style": "cyber_neon", "width": 1024, "height": 1024, "composite_subject": true}`

---

### B. Authentication & Users (`/api/v1/auth` & `/api/v1/users`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new customer/user account. |
| `POST` | `/api/v1/auth/login` | Public | Authenticate with email/password and receive JWT `access_token`. |
| `POST` | `/api/v1/auth/token` | Public | OAuth2 form-data token exchange (for Swagger UI Authorize button). |
| `GET` | `/api/v1/auth/me` | Bearer JWT | Return currently authenticated user profile. |
| `GET` | `/api/v1/users` | Admin JWT | List registered users (`offset`, `limit`). |
| `GET/PUT/DELETE` | `/api/v1/users/{public_id}` | Admin JWT | Inspect, update, or remove a user by UUID. |
| `PATCH` | `/api/v1/users/{public_id}/role` | Admin JWT | Update user role (`ADMIN`, `CUSTOMER`, `GUEST`). |

---

### C. Products, Orders & Payments (`/api/v1/products`, `/api/v1/orders`, `/api/v1/payments`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | Public | List products with optional `search`, `min_price`, `max_price`, `status`. |
| `GET` | `/api/v1/products/{product_id}` | Public | Get details for a single electronics product. |
| `POST` | `/api/v1/products` | Admin JWT | Upload/create a new product listing (supports Base64 or URL `banner_image`). |
| `PUT/DELETE` | `/api/v1/products/{product_id}` | Admin JWT | Update or delete an electronics listing. |
| `POST` | `/api/v1/orders` | Public/JWT | Place an order and automatically decrement inventory stock. |
| `GET` | `/api/v1/orders` | Admin JWT | List all customer orders. |
| `GET` | `/api/v1/orders/{order_id}` | Public/JWT | Track order status and details by order ID. |
| `PATCH` | `/api/v1/orders/{order_id}/status` | Admin JWT | Update fulfillment status (`PENDING`, `PROCESSING`, `APPROVED`, `SHIPPED`, `DELIVERED`, `CANCELLED`). |
| `POST` | `/api/v1/payments/pay` | Public/JWT | Settle payment for an order (`MOBILE MONEY`, `BANK`, `CRYPTO`). |
| `GET` | `/api/v1/payments/order/{order_id}` | Admin JWT | Retrieve payment receipt for a specific order. |

---

### D. AI Electronics Assistant (`/api/v1/ai`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/ai/recommend` | Public | Catalogue-grounded product recommendations by query & budget. |
| `GET` | `/api/v1/ai/smart-search?q=...` | Public | Synonym-aware electronics search. |
| `POST` | `/api/v1/ai/agents/{agent_name}` | Public | Run grounded store agents (`customer-shopping-assistant`, `business-intelligence`, `growth-optimization`, `marketing-content`). |
| `GET/POST` | `/api/v1/ai/interactions` | Admin JWT | View or log AI interaction records. |
