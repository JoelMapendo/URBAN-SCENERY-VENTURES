# Urban Scenery Ventures · TikTok Shop & Creator API Architecture Guide

> **Tagline:** *"Taking your business to the world"*  
> **Target Audience:** Developers, Merchants, and Project Stakeholders  
> **API Version:** TikTok Shop Open API `v202309` & TikTok Marketing API `v1.3`  
> **Status:** Integrated & Live in Seller Dashboard (`seller.html` · Tab: `TikTok Shop & Creator`)

---

## 1. Executive Summary & Strategic Vision

Modern e-commerce requires meeting customers where they spend their attention. For **Urban Scenery Ventures**, integrating **TikTok Shop & TikTok for Business** provides sellers with an automated bridge from traditional catalog management to viral, short-form video commerce and Live Stream shopping.

By embedding the TikTok interface directly into every seller's dashboard, merchants can:
1. **Push inventory in 1 click** from the Urban Scenery catalog to the official TikTok Shop US/Global catalog.
2. **Generate viral 15-second video hooks and scripts** tailored to TikTok's algorithm using background AI.
3. **Engage the TikTok Creator Marketplace** with automated affiliate commissions (e.g., 12%) and sample dispatches.
4. **Inspect live API transactions, payloads, and signatures** in a developer terminal with real-time feedback.
5. **Preview buyer in-app experience** using the interactive 9:16 smartphone feed simulator with TikTok Shop yellow bag express checkout.

---

## 2. TikTok API Ecosystem: The Two Pillars

Connecting to TikTok involves two distinct API services depending on whether you are managing commerce or running paid ads:

```
                            ┌───────────────────────────────────────────────┐
                            │        URBAN SCENERY VENTURES SELLER          │
                            └───────────────────────┬───────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
  ┌───────────────────────────────┐                                     ┌───────────────────────────────┐
  │     TIKTOK SHOP OPEN API      │                                     │     TIKTOK MARKETING API      │
  │        (Version 202309)       │                                     │         (Version 1.3)         │
  ├───────────────────────────────┤                                     ├───────────────────────────────┤
  │ • Merchant OAuth & Shop Cipher│                                     │ • TikTok Ads Manager OAuth    │
  │ • Product Catalog & Variants  │                                     │ • Spark Ads (Boosting Videos) │
  │ • Orders & Webhook Tracking   │                                     │ • Pixel & Events Ingestion    │
  │ • Logistics & Tracking Labels │                                     │ • Creator Marketplace Outreach│
  │ • Creator Open Collaborations │                                     │ • Campaign & Ad Group Budgets │
  │ Base: open-api.tiktokglobal...│                                     │ Base: business-api.tiktok.com │
  └───────────────────────────────┘                                     └───────────────────────────────┘
```

---

## 3. Authentication & Security Protocol

### 3.1 OAuth 2.0 Authorization Flow
Every merchant connects their TikTok Shop account via standard OAuth 2.0:
1. **Redirect Merchant:**  
   Direct the merchant to TikTok's partner authorization portal:
   ```
   https://services.tiktokshop.com/open/authorize?service_id={APP_KEY}&redirect_uri={REDIRECT_URI}&state={STATE}
   ```
2. **Authorization Code Callback:**  
   TikTok redirects the merchant back to your callback URL with `?code=AUTH_CODE`.
3. **Token Exchange:**  
   Exchange the auth code for an `access_token` and `refresh_token`:
   ```http
   GET https://auth.tiktok-shops.com/api/v2/token/get?app_key={APP_KEY}&app_secret={APP_SECRET}&auth_code={CODE}&grant_type=authorized_code
   ```
4. **Token Validity:**
   - `access_token`: Valid for **7 days**.
   - `refresh_token`: Valid for **30 days**. Tokens are automatically refreshed in the background.

### 3.2 HMAC-SHA256 Request Signing
Every request to the TikTok Shop Open API must include a cryptographically verifiable `sign` query parameter generated with your `app_secret`.

#### Signing Algorithm:
1. Extract all URL query parameters (excluding `sign` and `access_token`).
2. Sort parameter keys alphabetically.
3. Concatenate: `path + param1_key + param1_val + ... + JSON_request_body`.
4. Compute `HMAC-SHA256(app_secret, concatenated_string)`.
5. Convert the resulting hash to a lowercase hexadecimal string.

```javascript
// Web Crypto / Node.js signature snippet implemented in src/services/tiktokApi.js
const sortedKeys = Object.keys(queryParams).filter(k => k !== 'sign' && k !== 'access_token').sort();
let queryStr = '';
for (const k of sortedKeys) {
  queryStr += `${k}${queryParams[k]}`;
}
const message = `${path}${queryStr}${JSON.stringify(body || '')}`;
const signature = hmacSha256Hex(appSecret, message);
```

---

## 4. Core Endpoints Reference

### 4.1 Product Creation & Catalog Sync
**Endpoint:** `POST /api/products/202309/create`  
**Purpose:** Pushes a product listed on Urban Scenery into TikTok Shop.

#### Request Headers:
```http
Content-Type: application/json
x-tts-access-token: ttp_live_839a2f91048bca172849e
```

#### Request Body:
```json
{
  "title": "Urban Scenery Studio Pro Wireless Headphones",
  "description": "<p>Precision crafted with 40mm beryllium drivers, active noise cancellation, and 45h battery life.</p>",
  "category_id": "600102",
  "brand_id": "URBAN_SCENERY",
  "images": [
    { "uri": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" }
  ],
  "skus": [
    {
      "seller_sku": "US-AUDIO-001",
      "price": {
        "amount": "189.00",
        "currency": "USD"
      },
      "inventory": [
        {
          "warehouse_id": "WH_US_EAST_01",
          "quantity": 120
        }
      ]
    }
  ]
}
```

#### Response Body:
```json
{
  "code": 0,
  "message": "success",
  "request_id": "tt_prod_req_1793328901",
  "data": {
    "product_id": "tt_prod_7718921",
    "status": "LIVE",
    "audit_status": "APPROVED",
    "currency": "USD"
  }
}
```

---

### 4.2 Order Inflow & Webhook Notifications
**Endpoint:** `POST /api/orders/202309/orders/search`  
**Webhook Event:** `ORDER_STATUS_CHANGE`

When a viewer buys an item via the TikTok in-app yellow bag or live stream:
1. TikTok sends an encrypted webhook payload to `https://api.urbanscenery.io/webhooks/tiktok`.
2. The order is automatically parsed and added to the Seller's **Orders & Fulfillment** tab (`#dash-tab-orders`).
3. Urban Scenery AI decrement inventory reserves across both the storefront and TikTok Shop.

```json
{
  "event": "ORDER_STATUS_CHANGE",
  "timestamp": 1793329000,
  "data": {
    "order_id": "TT-984210941",
    "order_status": "AWAITING_SHIPMENT",
    "traffic_source": "TIKTOK_LIVE_STREAM",
    "buyer": {
      "name": "Sophia Chen",
      "handle": "@sophia_aesthetic"
    },
    "order_line_list": [
      {
        "product_id": "tt_prod_7718921",
        "sku_id": "US-AUDIO-001",
        "sale_price": "189.00",
        "quantity": 1
      }
    ]
  }
}
```

---

### 4.3 Creator Marketplace & Affiliate Collaboration
**Endpoint:** `POST /api/affiliate/202309/campaigns/create`  
**Purpose:** Enrolls inventory into the TikTok Shop Affiliate program so millions of creators can promote products in return for commission.

```json
{
  "name": "Urban Scenery Summer Creator Open Collaboration",
  "type": "OPEN_COLLABORATION",
  "commission_rate": 12,
  "sample_request_allowed": true,
  "product_ids": ["tt_prod_7718921", "tt_prod_7728921"]
}
```

---

## 5. Live Architecture in the Codebase

All components are implemented and functional in your local project:

| File | Role | Highlights |
| :--- | :--- | :--- |
| [`src/services/tiktokApi.js`](file:///Users/apple/Documents/AI%20GROUP%20WORK/src/services/tiktokApi.js) | Core API Service | HMAC-SHA256 signing, OAuth URL builder, catalog syncer, mock/sandbox dispatcher, API transaction event logger. |
| [`seller.html`](file:///Users/apple/Documents/AI%20GROUP%20WORK/seller.html) (`#dash-tab-tiktok`) | UI / UX Dashboard Tab | TikTok Partner header, live GMV & views HUD, 4 sub-tools, 9:16 smartphone simulator. |
| [`src/seller.js`](file:///Users/apple/Documents/AI%20GROUP%20WORK/src/seller.js) (`initTikTokInterface`) | Controller Logic | Subtab navigation, catalog table renderer, 1-click sync, ping health checker, credential storage, live terminal. |
| [`src/style.css`](file:///Users/apple/Documents/AI%20GROUP%20WORK/src/style.css) | Animations & Aesthetics | `@keyframes spin-slow` (vinyl disc), `@keyframes float-heart` (interactive like), TikTok cyan/magenta glows. |

---

## 6. Setup Guide: Transitioning from Sandbox to Production

Follow these steps when ready to connect to real TikTok production accounts:

### Step 1: Register as a TikTok Shop Partner
1. Visit the [TikTok Shop Partner Center](https://partner.tiktokshop.com/).
2. Register as an **Independent Software Vendor (ISV)** or **Developer**.
3. Select your operational regions (e.g. *United States*, *United Kingdom*, *Southeast Asia*).

### Step 2: Create a Developer Application
1. In the Partner Center Console, click **Create App**.
2. Select App Type: **Cross-Border / Local Merchant Tool**.
3. Under **Permission Management**, request the following scopes:
   - `product.manage` (Read/Write products)
   - `order.manage` (Read/Write orders)
   - `fulfillment.write` (Create shipping labels & tracking)
   - `marketing.ad.write` (TikTok Ads & Spark Ads)
   - `creator.affiliate` (Affiliate marketplace)

### Step 3: Enter Production Credentials in Urban Scenery
1. Navigate to **Seller Central** (`http://localhost:5173/seller.html#dashboard`).
2. Click the **TikTok Shop & Creator** tab in the navigation bar.
3. Click **API Credentials & Webhook Setup** (or the *API Inspector & Keys* sub-tab).
4. Change Environment from `Sandbox` to `Production`.
5. Paste your production `App Key`, `App Secret`, `Shop ID`, and `Access Token`.
6. Click **Save & Verify API Keys**. The system will immediately sign and execute a live health check ping.

---

## 7. Strategic Roadmap to Bring the Project to a High-End Success

To ensure Urban Scenery Ventures dominates as a next-generation AI e-commerce platform, here are five high-value roadmap features:

### 1. Automated TikTok Live Stream Shopping Drops
- **Concept:** Schedule flash sales timed with peak TikTok Live streams.
- **Implementation:** Connect to TikTok's Live Shopping API (`live_shopping.stream`). When a seller goes live or an affiliate mentions the item, the platform automatically drops a 15-minute countdown banner on the storefront and in the TikTok feed anchor.

### 2. Autonomous AI Video Generator (Product-to-Reel)
- **Concept:** Eliminate the need for sellers to film videos manually.
- **Implementation:** Using the AI script generator already built in `src/services/tiktokApi.js`, feed the scene timeline and product imagery into an AI video synthesis pipeline (e.g., Remotion / Sora API) to export finished, ready-to-post 9:16 vertical videos with trending audio.

### 3. Spark Ads Automated Budget Optimizer
- **Concept:** When an organic TikTok video tagged with an Urban Scenery product crosses 10,000 views with a conversion rate > 5%, the system automatically flags it in the seller dashboard with a 1-click button: *"Boost with $50 TikTok Spark Ad"*.

### 4. Multi-Warehouse Auto-Routing (Amazon FBA + TikTok Fulfillment)
- **Concept:** Seamless multi-channel fulfillment without stock collisions.
- **Implementation:** Integrate TikTok Shop Fulfillment (`FBT - Fulfilled by TikTok`) with Urban Scenery's internal inventory counter. When an item is bought on the web storefront, TikTok reserves are updated within 500ms via webhook.

### 5. AI Creator Matchmaker
- **Concept:** Match products with the top 1% highest-converting TikTok creators.
- **Implementation:** Analyze creator niche keywords, audience demographics, and average engagement rate to auto-generate personalized collaboration invitations directly through the TikTok Creator Marketplace API.

---

*Document generated for Urban Scenery Ventures · Taking your business to the world.*
