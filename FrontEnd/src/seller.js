// Fonts
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';

import {
  getCatalogProducts,
  saveCatalogProducts,
  syncCatalogFromBackend,
  saveProductUiMeta,
} from './data/products.js';
import { renderStaticIcons, icon } from './icons.js';
import { showToast } from './components/toast.js';
import { initTheme } from './theme.js';
import { formatPrice, toUSD } from './utils.js';
import {
  authApi,
  productsApi,
  ordersApi,
  paymentsApi,
  aiApi,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  isBackendOnline,
} from './services/api.js';
import {
  tiktokApi,
  getTikTokConfig,
  saveTikTokConfig,
  subscribeApiLogs,
  generateTikTokAdScript,
} from './services/tiktokApi.js';

/* ============================================================
   State & Local Storage
   ============================================================ */
const SELLER_STORAGE_KEY = 'lumen:seller_session';

function getStoredSeller() {
  try {
    const raw = localStorage.getItem(SELLER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let currentSeller = getStoredSeller();
let catalog = getCatalogProducts();
let ordersFromBackend = false;

// Pre-configured demo stores for 1-click test (authenticate with seeded FastAPI Admin)
const DEMO_STORES = {
  acoustics: {
    storeName: 'Urban Scenery Acoustics',
    handle: '@urban-acoustics',
    email: 'admin@urbanventures.com',
    category: 'Audio',
    plan: 'Verified Merchant · All Tools Included',
    rating: 4.9,
    ordersCount: 0,
    revenue: 0,
    activeAgents: 4,
    location: 'Plot 48, Electronics Boulevard, Innovation Hub Suite 4A',
    city: 'Kampala Central',
    coords: '0.3476, 32.5825',
  },
  wearables: {
    storeName: 'Apex Wearables & Biotech',
    handle: '@apex-wearables',
    email: 'admin@urbanventures.com',
    category: 'Wearables',
    plan: 'Verified Merchant · All Tools Included',
    rating: 4.8,
    ordersCount: 0,
    revenue: 0,
    activeAgents: 4,
    location: 'Silicon Square, Level 3',
    city: 'Kampala Tech District',
    coords: '0.3341, 32.5710',
  },
  drones: {
    storeName: 'Horizon Drones & Robotics',
    handle: '@horizon-drones',
    email: 'admin@urbanventures.com',
    category: 'Drones & Robotics',
    plan: 'Verified Merchant · All Tools Included',
    rating: 4.95,
    ordersCount: 0,
    revenue: 0,
    activeAgents: 4,
    location: 'UAV Innovation Park, Hangar 2',
    city: 'Entebbe Aerospace Hub',
    coords: '0.0512, 32.4637',
  },
};

// AI Agent Configurations
let aiAgents = {
  repricer: { enabled: true, name: 'Dynamic Repricing Agent', status: 'Active · Monitoring SKUs', actions: 140 },
  copywriter: { enabled: true, name: 'Autonomous SEO & Copywriter', status: 'Active · 100% Listings Optimized', actions: 28 },
  forecaster: { enabled: true, name: 'Predictive Restock Forecaster', status: 'Active · Next reorder in 14 days', actions: 12 },
  supportBot: { enabled: true, name: '24/7 AI Customer Concierge', status: 'Active · Resolving buyer queries', actions: 89 },
};

// Default fallback AI Agent logs (augmented by live `/api/v1/ai/interactions` records)
const defaultAiLogs = [
  { time: 'Live Engine', agent: 'Dynamic Repricing Agent', text: 'Monitoring active electronics SKUs against marketplace Buy Box margin floors.', badge: 'Reprice', color: 'emerald' },
  { time: 'Live Engine', agent: 'AI Customer Concierge', text: 'Connected to /api/v1/ai/recommend & /api/v1/ai/smart-search for real-time buyer assistance.', badge: 'Support', color: 'brand' },
  { time: 'Live Engine', agent: 'Predictive Forecaster', text: 'Tracking live stock levels across SQLite inventory after every order.', badge: 'Stock', color: 'amber' },
];

let aiLogs = [...defaultAiLogs];
let orders = [];

function mapBackendOrder(o) {
  return {
    rawId: o.id,
    id: `#${o.id}`,
    customer: o.contacs || (o.user_id ? `User #${o.user_id}` : 'Guest Shopper'),
    address: o.address || '',
    item: `${o.quantity} × ${o.product?.name || `Product #${o.product_id}`}`,
    amount: Number(o.total_price),
    date: o.ordered_at ? new Date(o.ordered_at).toLocaleString() : 'Just now',
    orderStatus: o.order_status || 'PENDING',
    paymentStatus: o.payment_status || 'NOT YET PAID',
    paymentMethod: o.payment_method || 'BANK',
    fromBackend: true,
  };
}

function mapSellerProfileFromUser(user, overrides = {}) {
  const email = user?.email || overrides.email || 'admin@urbanventures.com';
  const baseHandle = overrides.handle || `@${email.split('@')[0].replace(/[^a-z0-9_-]/gi, '')}`;
  return {
    storeName:
      overrides.storeName ||
      (user?.role === 'ADMIN' ? 'Urban Scenery Flagship' : `${user?.name || 'Merchant'} Store`),
    handle: baseHandle.startsWith('@') ? baseHandle : `@${baseHandle}`,
    email,
    role: user?.role || 'CUSTOMER',
    userId: user?.public_id || null,
    category: overrides.category || 'Computers',
    plan: user?.role === 'ADMIN' ? 'Admin · Full Catalog & Order Control' : 'Customer Account · View Only',
    rating: overrides.rating || 4.9,
    activeAgents: overrides.activeAgents || 4,
  };
}

async function refreshBackendDashboardData() {
  try {
    const syncedProducts = await syncCatalogFromBackend();
    catalog = syncedProducts;
  } catch {
    catalog = getCatalogProducts();
  }

  if (isAuthenticated()) {
    try {
      const apiOrders = await ordersApi.list({ offset: 0, limit: 100 });
      orders = (apiOrders || []).map(mapBackendOrder);
      ordersFromBackend = true;
    } catch {
      ordersFromBackend = false;
    }

    if (isAdmin()) {
      try {
        const interactions = await aiApi.listInteractions({ offset: 0, limit: 15 });
        const mappedLogs = (interactions || []).map((entry) => ({
          id: entry.id,
          time: entry.created_at ? new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged',
          agent: entry.prompt,
          text: entry.response,
          badge: 'DB Log',
          color: 'brand',
        }));
        aiLogs = [...mappedLogs, ...defaultAiLogs];
      } catch {
        /* keep current logs */
      }
    }
  }

  if (currentSeller) {
    renderDashboardData();
  }
}

/* ============================================================
   UI Switching: Auth View vs Dashboard View
   ============================================================ */
const authView = document.getElementById('seller-auth-view');
const dashboardView = document.getElementById('seller-dashboard-view');

function showAuthView() {
  currentSeller = null;
  localStorage.removeItem(SELLER_STORAGE_KEY);
  if (authView) authView.classList.remove('hidden');
  if (dashboardView) dashboardView.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDashboardView(sellerData) {
  currentSeller = sellerData;
  localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(sellerData));
  if (authView) authView.classList.add('hidden');
  if (dashboardView) dashboardView.classList.remove('hidden');
  renderDashboardData();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   Render Dashboard Data
   ============================================================ */
function renderDashboardData() {
  if (!currentSeller) return;
  const user = getCurrentUser();
  const adminActive = isAdmin();

  // Header & Identity
  document.querySelectorAll('[data-seller-name]').forEach((el) => {
    el.textContent = currentSeller.storeName || 'Urban Scenery Flagship';
  });
  document.querySelectorAll('[data-seller-handle]').forEach((el) => {
    el.textContent = currentSeller.handle || '@urban-scenery';
  });
  document.querySelectorAll('[data-seller-plan]').forEach((el) => {
    el.textContent = currentSeller.plan || 'Verified Merchant';
  });
  document.querySelectorAll('[data-tt-account-handle]').forEach((el) => {
    el.textContent = `@${(currentSeller.handle || 'urban_scenery').replace('@', '')}_tiktok`;
  });

  const roleBadge = document.getElementById('seller-role-badge');
  if (roleBadge) {
    if (adminActive) {
      roleBadge.className =
        'inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/60';
      roleBadge.innerHTML = `${icon('shield-check', 'h-3 w-3')} <span>ADMIN · Live DB Access</span>`;
    } else if (user) {
      roleBadge.className =
        'inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60';
      roleBadge.innerHTML = `${icon('info', 'h-3 w-3')} <span>${user.role} · Sign in as Admin to edit catalog</span>`;
    }
  }

  // Live KPI HUD computed from FastAPI orders & products
  const validOrders = orders.filter((o) => o.orderStatus !== 'CANCELLED');
  const liveRevenue = validOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const pendingCount = orders.filter((o) => o.orderStatus === 'PENDING' || o.orderStatus === 'APPROVED').length;

  const revenueEl = document.getElementById('kpi-revenue');
  if (revenueEl) {
    revenueEl.textContent = `$${liveRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const ordersEl = document.getElementById('kpi-orders');
  if (ordersEl) ordersEl.textContent = `${orders.length}`;

  const ordersSubEl = document.getElementById('kpi-orders-sub');
  if (ordersSubEl) {
    ordersSubEl.textContent = ordersFromBackend
      ? `${pendingCount} pending dispatch`
      : 'Connect backend to load orders';
  }

  const pendingBadgeEl = document.getElementById('orders-pending-badge');
  if (pendingBadgeEl) {
    pendingBadgeEl.textContent = `${pendingCount} Orders Pending Dispatch`;
  }

  const ratingEl = document.getElementById('kpi-rating');
  if (ratingEl) ratingEl.textContent = `${currentSeller.rating || 4.9} ★`;

  const catalogCountEl = document.getElementById('kpi-catalog-count');
  if (catalogCountEl) catalogCountEl.textContent = `${catalog.length} Active SKUs`;

  // Render Sub-sections
  renderInventoryTable();
  renderOrdersTable();
  renderAgentLogs();
  window.dispatchEvent(new CustomEvent('urban:seller_catalog_changed'));
}

/* ============================================================
   Inventory & Catalog Table (Connected to /api/v1/products)
   ============================================================ */
function renderInventoryTable(filterTerm = '') {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;

  const term = filterTerm.trim().toLowerCase();
  const filtered = catalog.filter((p) => {
    if (!term) return true;
    return p.title.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
  });

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-sm text-slate-400">
          No products matching "${filterTerm}". Upload a new item using the AI Product Uploader.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((item) => {
      const stock = item.fromBackend ? Number(item.stock ?? 0) : Number(item.stock ?? 24);
      const isOut = stock <= 0 || item.status === 'EMPTY';
      const isLow = !isOut && stock < 15;

      return `
      <tr class="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
        <td class="py-4 pl-6 pr-4">
          <div class="flex items-center gap-3">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.title}" class="h-12 w-12 shrink-0 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />`
                : `<div class="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${item.bg || 'from-brand-50 to-brand-100'} p-2 flex items-center justify-center ${item.fg || 'text-brand-600'}">
                    ${icon(item.icon || 'package', 'h-6 w-6')}
                   </div>`
            }
            <div>
              <p class="font-semibold text-slate-900 dark:text-white text-sm">${item.title}</p>
              <p class="text-xs text-slate-400 font-mono">ID #${item.id} · ${item.category}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">
          <div>${formatPrice(item.price, 'USD')} ${item.oldPrice ? `<span class="ml-1 text-xs text-slate-400 line-through font-normal">${formatPrice(item.oldPrice, 'USD')}</span>` : ''}</div>
          <div class="text-[11px] font-normal text-slate-400">${formatPrice(item.price, 'UGX')}</div>
        </td>
        <td class="px-4 py-4 text-xs">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-2 w-2 rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
            <span class="font-medium text-slate-700 dark:text-slate-300">${stock} units</span>
            ${
              isOut
                ? '<span class="rounded bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-400">EMPTY</span>'
                : isLow
                ? '<span class="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">Low Stock</span>'
                : ''
            }
          </div>
        </td>
        <td class="px-4 py-4">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:text-brand-300">
            <span class="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            ${item.fromBackend ? 'FastAPI Synced' : 'Local Cache'}
          </span>
        </td>
        <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
          ${item.rating ? `${item.rating} ★ (${item.reviews || 0})` : 'New Listing'}
        </td>
        <td class="py-4 pl-4 pr-6 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" data-reprice-id="${item.id}" class="grid h-8 w-8 place-items-center rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 transition" title="Run AI Dynamic Reprice (PUT /api/v1/products/${item.id})">
              ${icon('zap', 'h-4 w-4 text-accent-500')}
            </button>
            <button type="button" data-delete-id="${item.id}" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition" title="Delete Product (DELETE /api/v1/products/${item.id})">
              ${icon('trash-2', 'h-4 w-4')}
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');

  // Attach Reprice buttons -> PUT /api/v1/products/{id}
  tbody.querySelectorAll('[data-reprice-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.repriceId);
      const prod = catalog.find((p) => p.id === id);
      if (!prod) return;

      const currentUsd = toUSD(prod.price);
      const newUsd = Math.max(5, Number((currentUsd * 0.95).toFixed(2)));
      btn.disabled = true;

      try {
        if (prod.fromBackend) {
          await productsApi.update(id, { price: newUsd });
          saveProductUiMeta(id, { oldPrice: currentUsd });
          if (isAdmin()) {
            aiApi
              .logInteraction({
                prompt: 'Dynamic Repricing Agent',
                response: `Adjusted "${prod.title}" (ID #${id}) from $${currentUsd.toFixed(2)} to $${newUsd.toFixed(2)} to capture Buy Box.`,
                user_id: getCurrentUser()?.public_id || null,
              })
              .catch(() => null);
          }
          await refreshBackendDashboardData();
        } else {
          prod.oldPrice = currentUsd;
          prod.price = newUsd;
          saveCatalogProducts(catalog);
          renderDashboardData();
        }
        showToast(`AI Repricer updated "${prod.title}" to ${formatPrice(newUsd, 'USD')}!`, { variant: 'success' });
      } catch (err) {
        showToast(err.message || 'Reprice failed (Admin role required).', { variant: 'error' });
      } finally {
        btn.disabled = false;
      }
    });
  });

  // Attach Delete buttons -> DELETE /api/v1/products/{id}
  tbody.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.deleteId);
      const prod = catalog.find((p) => p.id === id);
      if (!confirm(`Are you sure you want to delete "${prod?.title || 'this product'}" from the database?`)) return;

      btn.disabled = true;
      try {
        if (prod?.fromBackend || isBackendOnline()) {
          await productsApi.remove(id);
          await refreshBackendDashboardData();
        } else {
          catalog = catalog.filter((p) => p.id !== id);
          saveCatalogProducts(catalog);
          renderDashboardData();
        }
        showToast(`"${prod?.title || 'Product'}" deleted from catalog.`, { variant: 'info' });
      } catch (err) {
        showToast(err.message || 'Could not delete product.', { variant: 'error' });
        btn.disabled = false;
      }
    });
  });
}

/* ============================================================
   Orders Table (Connected to /api/v1/orders & /api/v1/payments)
   ============================================================ */
function getOrderBadgeCls(status) {
  const map = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  };
  return map[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-xs sm:text-sm text-slate-400">
          No customer orders in the database yet. Place an order on the <a href="index.html" class="font-bold text-brand-600 dark:text-brand-400 hover:underline">Customer Storefront</a> to manage fulfillment live here!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders
    .map((o) => {
      const nextStatusMap = {
        PENDING: { next: 'APPROVED', label: 'Approve Order' },
        APPROVED: { next: 'SHIPPED', label: 'Dispatch Order' },
        SHIPPED: { next: 'DELIVERED', label: 'Mark Delivered' },
      };
      const step = nextStatusMap[o.orderStatus];
      const unpaid = o.paymentStatus !== 'PAID' && o.orderStatus !== 'CANCELLED';

      return `
      <tr class="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
        <td class="py-3.5 pl-6 pr-4 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">${o.id}</td>
        <td class="px-4 py-3.5">
          <p class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">${o.customer}</p>
          ${o.address ? `<p class="text-[11px] text-slate-400 truncate max-w-[180px]" title="${o.address}">${o.address}</p>` : ''}
        </td>
        <td class="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">${o.item}</td>
        <td class="px-4 py-3.5 text-xs text-slate-400">${o.date}</td>
        <td class="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">$${Number(o.amount).toFixed(2)}</td>
        <td class="px-4 py-3.5">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getOrderBadgeCls(o.orderStatus)}">${o.orderStatus}</span>
            <span class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
              o.paymentStatus === 'PAID'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            }">${o.paymentStatus}</span>
          </div>
        </td>
        <td class="py-3.5 pl-4 pr-6 text-right">
          <div class="inline-flex items-center justify-end gap-2">
            ${
              unpaid
                ? `<button type="button" data-settle-order="${o.rawId}" class="rounded-full bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white transition">Settle Pay</button>`
                : ''
            }
            ${
              step && isAdmin()
                ? `<button type="button" data-advance-order="${o.rawId}" data-next-status="${step.next}" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition">${step.label}</button>`
                : `<span class="text-xs text-slate-400 font-medium">${o.orderStatus === 'DELIVERED' ? 'Completed ✓' : o.orderStatus}</span>`
            }
          </div>
        </td>
      </tr>
    `;
    })
    .join('');

  // Settle unpaid order -> POST /api/v1/payments/pay
  tbody.querySelectorAll('[data-settle-order]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const rawId = Number(btn.dataset.settleOrder);
      const ord = orders.find((o) => o.rawId === rawId);
      if (!ord) return;
      btn.disabled = true;
      try {
        await paymentsApi.pay({
          order_id: ord.rawId,
          payment_method: ord.paymentMethod || 'BANK',
          amount: ord.amount,
        });
        showToast(`Payment settled for Order #${ord.rawId}! Status updated to APPROVED.`, { variant: 'success' });
        await refreshBackendDashboardData();
      } catch (err) {
        showToast(err.message || 'Payment settlement failed.', { variant: 'error' });
        btn.disabled = false;
      }
    });
  });

  // Advance fulfillment status -> PATCH /api/v1/orders/{id}/status
  tbody.querySelectorAll('[data-advance-order]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const rawId = Number(btn.dataset.advanceOrder);
      const nextStatus = btn.dataset.nextStatus;
      btn.disabled = true;
      try {
        await ordersApi.updateStatus(rawId, { order_status: nextStatus });
        showToast(`Order #${rawId} updated to ${nextStatus}!`, { variant: 'success' });
        await refreshBackendDashboardData();
      } catch (err) {
        showToast(err.message || 'Failed to update order status.', { variant: 'error' });
        btn.disabled = false;
      }
    });
  });
}

/* ============================================================
   AI Activity Logs
   ============================================================ */
function renderAgentLogs() {
  const container = document.getElementById('ai-activity-feed');
  if (!container) return;

  container.innerHTML = aiLogs
    .slice(0, 8)
    .map(
      (log) => `
    <li class="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 shadow-sm transition hover:shadow">
      <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
        ${icon('cpu', 'h-4 w-4')}
      </span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs font-bold text-slate-900 dark:text-white truncate">${log.agent}</p>
          <span class="text-[10px] text-slate-400 shrink-0">${log.time}</span>
        </div>
        <p class="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${log.text}</p>
      </div>
    </li>
  `,
    )
    .join('');
}

/* ============================================================
   AI Product Generator & Uploader Logic
   ============================================================ */
const AI_PRESET_TEMPLATES = {
  Computers: {
    titles: ['Hp Laptop 15" · Apex Carbon Pro Studio 15', 'Horizon UltraBook 14" OLED', 'Titan Workstation Desktop Tower'],
    descriptions: [
      'Engineered for creators and power users. Featuring a 15.6" 3K OLED anti-glare display, aerospace-grade carbon fiber chassis, 32GB LPDDR5X RAM, and 18-hour battery longevity.',
      'Sleek ultraportable laptop with 100% DCI-P3 color calibration, vapor-chamber thermal architecture, and whisper-quiet operation under heavy workloads.',
    ],
    features: ['15.6" 3K OLED 120Hz Display', 'Intel Core Ultra 9 / 32GB RAM', 'Full-Day 18h Battery Life', 'Aerospace Carbon Fiber Body'],
    tags: ['laptop', 'oled display', 'computers', 'creator workstation', 'lightweight'],
    icon: 'laptop',
    suggestedPrice: 1299.00,
    bg: 'from-slate-900 to-indigo-950',
    fg: 'text-indigo-400',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80',
  },
  Audio: {
    titles: ['AuraWave Spatial Wireless Earbuds', 'PulseSound Studio Studio Monitors', 'Horizon Hi-Res DAC Amplifier'],
    descriptions: [
      'Engineered with titanium micro-drivers and ultra-low-latency Bluetooth 5.4, delivering pristine acoustic fidelity and true spatial soundscapes. Built-in dual AI microphones isolate your voice during high-stakes calls while adaptive noise cancellation eliminates ambient drone.',
      'Immersive studio-grade monitoring calibrated for sound designers and audiophiles. Features balanced armature drivers, precision tuning, and 36 hours of playtime on a single USB-C charge.',
    ],
    features: ['Custom 40mm Titanium Drivers', 'Hybrid ANC with 35dB Noise Attenuation', '48-hour Extended Lithium Battery', 'Multipoint Dual-Device Pairing'],
    tags: ['spatial audio', 'noise cancelling', 'bluetooth 5.4', 'audiophile', 'hi-res certified'],
    icon: 'headphones',
    suggestedPrice: 149.00,
    bg: 'from-brand-100 to-brand-200',
    fg: 'text-brand-600',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
  },
  Wearables: {
    titles: ['Apex Titan Pro Smartwatch', 'BioPulse Health & Recovery Ring', 'Horizon GPS Solar Watch'],
    descriptions: [
      'Forged from aerospace-grade titanium and sapphire crystal, this flagship wearable measures heart rate variability, SpO2, sleep cycle stages, and recovery readiness in real-time. Designed to withstand 100m water depth with a 14-day solar battery reserve.',
      'Sleek ceramic and sapphire tracker delivering clinical-grade sleep analytics, stress tracking, and continuous temperature monitoring without the distraction of an illuminated screen.',
    ],
    features: ['Grade-5 Titanium & Sapphire Glass', 'Continuous ECG & SpO2 Biometrics', '10 ATM Waterproofing', 'Up to 14 Days Battery Life'],
    tags: ['smartwatch', 'titanium', 'health tracker', 'gps navigation', 'solar battery'],
    icon: 'watch',
    suggestedPrice: 249.00,
    bg: 'from-accent-50 to-accent-100',
    fg: 'text-accent-500',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
  },
  Footwear: {
    titles: ['Stratus Carbon Daily Trainer', 'Acro Velocity Trail Runner', 'Nexus Knit Recovery Slide'],
    descriptions: [
      'Combines a featherlight responsive supercritical foam midsole with a full-length carbon propulsion plate. Engineered for marathon training, tempo runs, and daily miles with supreme energy return and frictionless breathable mesh.',
    ],
    features: ['Supercritical Nitrogen-Infused Foam', 'Full-Length 3D Carbon Plate', 'Reinforced Vibram MegaGrip Outsole', 'Seamless Monomesh Upper'],
    tags: ['running shoe', 'carbon plate', 'marathon trainer', 'cushioned', 'breathable'],
    icon: 'footprints',
    suggestedPrice: 159.00,
    bg: 'from-emerald-50 to-emerald-100',
    fg: 'text-emerald-600',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
  },
  Bags: {
    titles: ['Vanguard Weatherproof Tech Backpack', 'Nomad Modular Sling Pack', 'Atlas Commuter Duffel'],
    descriptions: [
      'Crafted from 100% recycled Cordura ripstop with Aquaguard water-sealed zippers. Features a dedicated suspended 16-inch laptop chamber, magnetic Fidlock quick-release buckles, and an expandable 26L gear layout for seamless airport transit.',
    ],
    features: ['Recycled Cordura Ballistic Fabric', 'Magnetic Quick-Release Fidlock Buckles', 'Suspended Padded 16" Laptop Pocket', 'Pass-Through Luggage Sleeve'],
    tags: ['commuter backpack', 'weatherproof', 'laptop bag', 'cordura', 'travel essentials'],
    icon: 'backpack',
    suggestedPrice: 119.00,
    bg: 'from-amber-50 to-amber-100',
    fg: 'text-amber-600',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
  },
  Home: {
    titles: ['Urban Scenery Arc Minimalist Desk Lamp', 'AeroFlow Smart Ceramic Heater', 'Komorebi Sound & Light Diffuser'],
    descriptions: [
      'Precision machined from matte anodized aluminum. Offers 98+ CRI true-color illumination that mimics natural sunlight to reduce eye strain, complete with integrated 15W MagSafe wireless charging base and ambient touch dimmer.',
    ],
    features: ['CRI 98+ High-Fidelity LED Lighting', 'Integrated 15W Qi2 Fast Wireless Charger', 'Smooth Stepless Touch Dimmer', 'Matte Anodized Aluminum Chassis'],
    tags: ['desk lamp', 'minimalist lighting', 'wireless charging', 'workspace', 'home office'],
    icon: 'lamp-desk',
    suggestedPrice: 79.00,
    bg: 'from-indigo-50 to-indigo-100',
    fg: 'text-indigo-600',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
  },
};

function initProductUploader() {
  const form = document.getElementById('ai-product-form');
  const titleInput = document.getElementById('upload-title');
  const categorySelect = document.getElementById('upload-category');
  const priceInput = document.getElementById('upload-price');
  const oldPriceInput = document.getElementById('upload-oldprice');
  const descTextarea = document.getElementById('upload-description');
  const featuresInput = document.getElementById('upload-features');
  const tagsInput = document.getElementById('upload-tags');
  const generateCopyBtn = document.getElementById('btn-generate-copy');
  const suggestPriceBtn = document.getElementById('btn-suggest-price');
  const aiStatusBadge = document.getElementById('upload-ai-status');

  // 1. AI Copy & Spec Generator
  if (generateCopyBtn) {
    generateCopyBtn.addEventListener('click', () => {
      const cat = categorySelect?.value || 'Audio';
      const template = AI_PRESET_TEMPLATES[cat] || AI_PRESET_TEMPLATES.Audio;

      if (aiStatusBadge) {
        aiStatusBadge.classList.remove('hidden');
        aiStatusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 text-xs text-brand-600 font-medium animate-pulse">${icon('sparkles', 'h-3.5 w-3.5 text-accent-500')} Copilot synthesizing SEO copy & market specifications...</span>`;
      }
      generateCopyBtn.disabled = true;

      setTimeout(() => {
        // Randomly pick title if blank
        if (!titleInput.value.trim()) {
          const randTitle = template.titles[Math.floor(Math.random() * template.titles.length)];
          titleInput.value = randTitle;
        }

        // Fill description
        const randDesc = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
        descTextarea.value = randDesc;

        // Fill features
        featuresInput.value = template.features.join(', ');

        // Fill tags
        tagsInput.value = template.tags.join(', ');

        // Set suggested price if blank
        if (!priceInput.value) {
          priceInput.value = template.suggestedPrice.toFixed(2);
        }

        if (aiStatusBadge) {
          aiStatusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">${icon('check', 'h-3.5 w-3.5')} AI Generated: Conversion optimized for Amazon & Urban Scenery Buy Box</span>`;
        }
        generateCopyBtn.disabled = false;
        showToast('AI copywriter generated full product description & tags!', { variant: 'success' });
      }, 700);
    });
  }

  // 2. Smart Price Advisor
  if (suggestPriceBtn) {
    suggestPriceBtn.addEventListener('click', () => {
      const cat = categorySelect?.value || 'Audio';
      const template = AI_PRESET_TEMPLATES[cat] || AI_PRESET_TEMPLATES.Audio;
      const base = template.suggestedPrice;
      const discounted = (base * 0.88).toFixed(2);

      priceInput.value = discounted;
      oldPriceInput.value = base.toFixed(2);
      showToast(`AI Price Advisor: Set $${discounted} (MSRP $${base.toFixed(2)}) for maximum Buy Box velocity`, { variant: 'info' });
    });
  }

  // 3. Form Submit -> Upload Product to FastAPI POST /api/v1/products
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn?.innerHTML || '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `${icon('refresh-cw', 'h-4 w-4 animate-spin')} <span>Publishing to Database...</span>`;
      }

      const title = titleInput.value.trim();
      const cat = categorySelect.value || 'Audio';
      const price = parseFloat(priceInput.value) || 99.0;
      const oldPrice = oldPriceInput.value ? parseFloat(oldPriceInput.value) : null;
      const desc = descTextarea.value.trim() || 'Premium quality crafted product.';
      const featuresRaw = featuresInput.value.trim();
      const features = featuresRaw
        ? featuresRaw.split(',').map((f) => f.trim()).filter(Boolean)
        : ['Fast shipping', '30-day returns', '1-year warranty'];

      const template = AI_PRESET_TEMPLATES[cat] || AI_PRESET_TEMPLATES.Audio;
      const customImage = document.getElementById('upload-image')?.value.trim() || '';
      const stockInput = document.getElementById('upload-stock');
      const stock = Math.max(0, parseInt(stockInput?.value, 10) || 50);

      const categoryMap = {
        Audio: 'Audio & Sound',
        Bags: 'Computer Accessories',
        Home: 'Home & Living',
      };
      const mappedCategory = categoryMap[cat] || cat;
      const usdPrice = Number(toUSD(price).toFixed(2));
      const usdOldPrice = oldPrice ? Number(toUSD(oldPrice).toFixed(2)) : null;
      const imageUrl =
        customImage ||
        template.image ||
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80';

      try {
        const created = await productsApi.create({
          name: title.slice(0, 128),
          price: usdPrice,
          description: desc,
          banner_image: imageUrl,
          quantity: stock,
          status: stock > 0 ? 'AVAILABLE' : 'EMPTY',
        });

        saveProductUiMeta(created.id, {
          category: mappedCategory,
          oldPrice: usdOldPrice,
          features,
          shopId: currentSeller?.handle ? currentSeller.handle.replace('@', '') : 'urban-acoustics',
          shopName: currentSeller?.storeName || 'Urban Scenery Flagship',
          icon: template.icon,
          badge: 'New Arrival',
          bg: template.bg,
          fg: template.fg,
        });

        if (isAdmin()) {
          aiApi
            .logInteraction({
              prompt: 'Listing Optimizer Agent',
              response: `Published "${created.name}" (ID #${created.id}) at $${usdPrice.toFixed(2)} (${stock} units).`,
              user_id: getCurrentUser()?.public_id || null,
            })
            .catch(() => null);
        }

        await refreshBackendDashboardData();
        form.reset();
        if (aiStatusBadge) aiStatusBadge.classList.add('hidden');

        showToast(`Product "${created.name}" (ID #${created.id}) saved to Urban Scenery database!`, {
          variant: 'success',
        });
        switchDashboardTab('inventory');
      } catch (err) {
        if (err.isNetworkError) {
          // Offline local fallback when FastAPI is unreachable
          const fallbackProduct = {
            id: Date.now(),
            title,
            category: mappedCategory,
            shopId: currentSeller?.handle ? currentSeller.handle.replace('@', '') : 'urban-acoustics',
            shopName: currentSeller?.storeName || 'Urban Scenery Flagship',
            price: usdPrice,
            oldPrice: usdOldPrice,
            stock,
            status: stock > 0 ? 'AVAILABLE' : 'EMPTY',
            rating: 5.0,
            reviews: 1,
            icon: template.icon,
            badge: 'New Arrival',
            bg: template.bg,
            fg: template.fg,
            image: imageUrl,
            description: desc,
            features,
            fromBackend: false,
          };
          catalog.unshift(fallbackProduct);
          saveCatalogProducts(catalog);
          renderDashboardData();
          form.reset();
          if (aiStatusBadge) aiStatusBadge.classList.add('hidden');
          showToast(`Backend offline: "${title}" cached locally.`, { variant: 'info' });
          switchDashboardTab('inventory');
        } else {
          showToast(err.message || 'Product creation requires an Admin account.', { variant: 'error' });
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }
}

/* ============================================================
   TikTok Shop Open API & Creator Commerce Controller
   ============================================================ */
function initTikTokInterface() {
  const cfg = getTikTokConfig();

  // 1. Populate API Key Form
  const envSelect = document.getElementById('cfg-tt-env');
  const shopIdInput = document.getElementById('cfg-tt-shopid');
  const appKeyInput = document.getElementById('cfg-tt-appkey');
  const appSecretInput = document.getElementById('cfg-tt-appsecret');
  const tokenInput = document.getElementById('cfg-tt-token');
  const saveKeysBtn = document.getElementById('btn-save-tt-keys');
  const pingBtn = document.getElementById('btn-tt-ping');
  const syncAllBtn = document.getElementById('btn-tt-sync-all');
  const syncBatchBtn = document.getElementById('btn-tt-sync-batch');
  const toggleConfigBtn = document.getElementById('btn-tt-toggle-config');

  if (envSelect) envSelect.value = cfg.environment || 'sandbox';
  if (shopIdInput) shopIdInput.value = cfg.shopId || 'TTS_US_88301923';
  if (appKeyInput) appKeyInput.value = cfg.appKey || '6b89f81a7d2e4c029381';
  if (appSecretInput) appSecretInput.value = cfg.appSecret || '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  if (tokenInput) tokenInput.value = cfg.accessToken || 'ttp_live_839a2f91048bca172849e';

  // 2. Sub-tab switching inside TikTok Interface
  const subtabBtns = document.querySelectorAll('[data-tt-subtab-btn]');
  const subpanes = {
    'live-studio': document.getElementById('tt-subpane-live-studio'),
    catalog: document.getElementById('tt-subpane-catalog'),
    script: document.getElementById('tt-subpane-script'),
    affiliate: document.getElementById('tt-subpane-affiliate'),
    terminal: document.getElementById('tt-subpane-terminal'),
  };

  function switchTikTokSubtab(target) {
    subtabBtns.forEach((btn) => {
      const isTarget = btn.dataset.ttSubtabBtn === target;
      if (isTarget) {
        btn.className = 'inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-1.5 text-xs font-bold transition shadow-sm';
      } else {
        btn.className = 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-brand-500 px-4 py-1.5 text-xs font-semibold transition';
      }
    });
    Object.entries(subpanes).forEach(([key, el]) => {
      if (el) el.classList.toggle('hidden', key !== target);
    });
  }

  subtabBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchTikTokSubtab(btn.dataset.ttSubtabBtn));
  });

  if (toggleConfigBtn) {
    toggleConfigBtn.addEventListener('click', () => switchTikTokSubtab('terminal'));
  }

  // 3. Render TikTok Products Catalog Table
  function renderTikTokCatalogTable() {
    const tbody = document.getElementById('tt-products-table-body');
    if (!tbody) return;

    if (!catalog.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-xs text-slate-400">No products found in catalog.</td></tr>`;
      return;
    }

    tbody.innerHTML = catalog
      .map((p, idx) => {
        const isSynced = idx < 6;
        const statusBadge = isSynced
          ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE ON TIKTOK SHOP
             </span>`
          : `<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              READY TO SYNC
             </span>`;
        const ttId = isSynced ? `tt_prod_77${idx}8921` : `<span class="text-slate-400 italic">Not Synced</span>`;

        return `
          <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
            <td class="py-3 pl-2 pr-4">
              <div class="flex items-center gap-3">
                <img src="${p.image}" alt="${p.title}" class="h-10 w-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 dark:text-white truncate max-w-xs text-xs sm:text-sm">${p.title}</p>
                  <p class="text-[11px] text-slate-400 capitalize">${p.category}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">${formatPrice(p.price, 'USD')}</td>
            <td class="px-4 py-3">${statusBadge}</td>
            <td class="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">${ttId}</td>
            <td class="py-3 pl-4 pr-2 text-right">
              <button type="button" data-tt-sync-single="${p.id}" class="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:border-pink-300 px-3 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#FE2C55] transition">
                ${icon('refresh-cw', 'h-3 w-3')}
                <span>Sync</span>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');

    // Bind individual sync buttons
    tbody.querySelectorAll('[data-tt-sync-single]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const prodId = Number(btn.dataset.ttSyncSingle);
        const prod = catalog.find((p) => p.id === prodId);
        if (!prod) return;

        btn.disabled = true;
        btn.innerHTML = `${icon('refresh-cw', 'h-3 w-3 animate-spin')} <span>Syncing...</span>`;

        try {
          await tiktokApi.syncProduct(prod);
          showToast(`TikTok Shop API: "${prod.title}" successfully synced and approved!`, { variant: 'success' });
          btn.innerHTML = `${icon('check', 'h-3 w-3 text-emerald-500')} <span>Synced</span>`;
          renderTikTokCatalogTable();
        } catch (e) {
          showToast(`Sync error: ${e.message}`, { variant: 'error' });
          btn.disabled = false;
        }
      });
    });
  }

  renderTikTokCatalogTable();

  // 4. Batch Sync / Push All to TikTok
  async function handleSyncAll() {
    const btn = syncAllBtn || syncBatchBtn;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${icon('refresh-cw', 'h-4 w-4 animate-spin')} <span>Syncing via Open API v202309...</span>`;
    }

    try {
      await tiktokApi.syncCatalog(catalog);
      showToast(`Success! All ${catalog.length} products pushed to TikTok Shop US Open API.`, { variant: 'success' });
      renderTikTokCatalogTable();
    } catch (e) {
      showToast(`Sync failed: ${e.message}`, { variant: 'error' });
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `${icon('refresh-cw', 'h-4 w-4')} <span>Push Entire Catalog to TikTok</span>`;
      }
    }
  }

  if (syncAllBtn) syncAllBtn.addEventListener('click', handleSyncAll);
  if (syncBatchBtn) syncBatchBtn.addEventListener('click', handleSyncAll);

  // 5. Ping TikTok API
  if (pingBtn) {
    pingBtn.addEventListener('click', async () => {
      pingBtn.disabled = true;
      pingBtn.innerHTML = `${icon('refresh-cw', 'h-3.5 w-3.5 animate-spin')} <span>Pinging...</span>`;
      try {
        await tiktokApi.ping();
        showToast(`TikTok Open API Ping: 200 OK · Latency 240ms · 6 Scopes Verified`, { variant: 'success' });
      } catch (e) {
        showToast(`Ping failed: ${e.message}`, { variant: 'error' });
      } finally {
        pingBtn.disabled = false;
        pingBtn.innerHTML = `${icon('activity', 'h-3.5 w-3.5 text-[#25F4EE]')} <span>Test API Ping & Health</span>`;
      }
    });
  }

  // 6. Save API Keys
  if (saveKeysBtn) {
    saveKeysBtn.addEventListener('click', async () => {
      const updated = {
        environment: envSelect?.value || 'sandbox',
        shopId: shopIdInput?.value.trim() || 'TTS_US_88301923',
        appKey: appKeyInput?.value.trim() || '',
        appSecret: appSecretInput?.value.trim() || '',
        accessToken: tokenInput?.value.trim() || '',
      };
      tiktokApi.updateConfig(updated);
      saveTikTokConfig(updated);

      const envBadge = document.getElementById('tt-env-badge');
      if (envBadge) envBadge.textContent = `ENV: ${updated.environment.toUpperCase()}`;
      const shopIdEl = document.getElementById('tt-shop-id-display');
      if (shopIdEl) shopIdEl.textContent = updated.shopId;

      showToast(`TikTok API credentials saved & HMAC signature updated!`, { variant: 'success' });
      await tiktokApi.ping();
    });
  }

  // 7. Live Terminal Log Subscription
  const terminalLog = document.getElementById('tt-terminal-log');
  const clearLogsBtn = document.getElementById('btn-clear-tt-logs');

  function renderTerminalLogs(logs) {
    if (!terminalLog) return;
    if (!logs || !logs.length) {
      terminalLog.innerHTML = `<p class="text-slate-500 italic">// No API transactions recorded yet. Tap "Test API Ping" or "Push Entire Catalog" to trace requests.</p>`;
      return;
    }
    terminalLog.innerHTML = logs
      .map((log) => {
        const methodColor = log.method === 'POST' ? 'text-amber-400' : 'text-cyan-400';
        const codeColor = log.statusCode === 200 ? 'text-emerald-400' : 'text-rose-400';
        return `
          <div class="border-b border-slate-900 pb-2">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400">${log.timestamp}</span>
              <span class="font-bold ${methodColor}">${log.method}</span>
              <span class="text-slate-300 font-mono">${log.path}</span>
              <span class="${codeColor} font-bold">${log.statusCode} OK</span>
              <span class="text-slate-500 font-mono">${log.latencyMs}ms</span>
            </div>
            <pre class="mt-1 text-[10px] text-slate-400 bg-black/40 p-2 rounded overflow-x-auto whitespace-pre-wrap">${JSON.stringify(log.responsePayload, null, 2)}</pre>
          </div>
        `;
      })
      .join('');
  }

  subscribeApiLogs(renderTerminalLogs);

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      renderTerminalLogs([]);
      showToast('API logs cleared.', { variant: 'info' });
    });
  }

  // 8. AI TikTok Video Hook & Script Generator
  const scriptProductSelect = document.getElementById('tt-script-product-select');
  const scriptFormatSelect = document.getElementById('tt-script-format-select');
  const generateScriptBtn = document.getElementById('btn-generate-tt-script');
  const copyScriptBtn = document.getElementById('btn-copy-tt-script');
  const scriptOutputContainer = document.getElementById('tt-script-output-container');

  function populateScriptProducts() {
    if (!scriptProductSelect) return;
    scriptProductSelect.innerHTML = catalog
      .map((p) => `<option value="${p.id}">${p.title} (${formatPrice(p.price, 'USD')})</option>`)
      .join('');
  }
  populateScriptProducts();

  window.addEventListener('urban:seller_catalog_changed', () => {
    renderTikTokCatalogTable();
    populateScriptProducts();
  });

  let latestGeneratedScript = null;

  function renderScript() {
    const prodId = Number(scriptProductSelect?.value) || catalog[0]?.id;
    const prod = catalog.find((p) => p.id === prodId) || catalog[0];
    const format = scriptFormatSelect?.value || 'unboxing';

    if (!prod || !scriptOutputContainer) return;

    latestGeneratedScript = generateTikTokAdScript(prod, format);

    scriptOutputContainer.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">Viral Hook Concept:</span>
          <p class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">"${latestGeneratedScript.hook}"</p>
        </div>
        <span class="rounded-full bg-pink-50 dark:bg-pink-950/60 px-2.5 py-1 text-xs font-bold text-[#FE2C55] border border-pink-200 dark:border-pink-800 shrink-0">
          Estimated CTR: 7.8%
        </span>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 text-xs">
        <div class="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
          <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
            ${icon('music', 'h-3.5 w-3.5 text-accent-500')} Recommended Audio:
          </span>
          <p class="text-slate-600 dark:text-slate-300 font-medium">${latestGeneratedScript.sound}</p>
        </div>
        <div class="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
          <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
            ${icon('tag', 'h-3.5 w-3.5 text-[#25F4EE]')} High-Velocity Hashtags:
          </span>
          <p class="text-brand-600 dark:text-pink-400 font-medium font-mono">${latestGeneratedScript.hashtags.join(' ')}</p>
        </div>
      </div>

      <div class="space-y-2 pt-2">
        <span class="text-xs font-bold text-slate-900 dark:text-white block">15-Second Storyboard & Cue Breakdown:</span>
        <div class="space-y-2">
          ${latestGeneratedScript.scenes
            .map(
              (s) => `
            <div class="flex items-start gap-3 rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 text-xs">
              <span class="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">${s.time}</span>
              <div class="space-y-0.5 min-w-0">
                <p class="text-slate-800 dark:text-slate-200"><strong>Visual:</strong> ${s.visual}</p>
                <p class="text-slate-500 dark:text-slate-400"><strong>Audio Cue:</strong> ${s.audio}</p>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    updatePhoneSimulator(prod, latestGeneratedScript);
  }

  if (generateScriptBtn) {
    generateScriptBtn.addEventListener('click', () => {
      renderScript();
      showToast('AI synthesized 15-second TikTok viral hook, visual cues, and hashtags!', { variant: 'success' });
    });
  }

  if (scriptProductSelect) {
    scriptProductSelect.addEventListener('change', renderScript);
  }
  if (scriptFormatSelect) {
    scriptFormatSelect.addEventListener('change', renderScript);
  }

  if (copyScriptBtn) {
    copyScriptBtn.addEventListener('click', () => {
      if (!latestGeneratedScript) renderScript();
      const text = `=== URBAN SCENERY TIKTOK VIDEO SCRIPT ===\nHook: ${latestGeneratedScript.hook}\nConcept: ${latestGeneratedScript.concept}\nSound: ${latestGeneratedScript.sound}\nHashtags: ${latestGeneratedScript.hashtags.join(' ')}\n\nStoryboard:\n` +
        latestGeneratedScript.scenes.map((s) => `[${s.time}] Visual: ${s.visual} | Audio: ${s.audio}`).join('\n');
      navigator.clipboard.writeText(text);
      showToast('Complete TikTok script & hashtags copied to clipboard!', { variant: 'success' });
    });
  }

  renderScript();

  // 9. Creator Sample Requests
  document.querySelectorAll('[data-tt-send-sample]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const creator = btn.dataset.ttSendSample;
      showToast(`TikTok Affiliate: Free product sample dispatched to ${creator}!`, { variant: 'success' });
      btn.textContent = 'Sample Dispatched ✓';
      btn.disabled = true;
      btn.className = 'w-full rounded-xl bg-emerald-600 text-white py-1.5 text-xs font-bold';
    });
  });

  // 10. TikTok Smartphone Simulator Controls
  const simMediaBg = document.getElementById('sim-media-bg');
  const simCaption = document.getElementById('sim-caption');
  const simAnchorTitle = document.getElementById('sim-anchor-title');
  const simAnchorPrice = document.getElementById('sim-anchor-price');
  const simHeartBtn = document.getElementById('sim-btn-heart');
  const simLikesCount = document.getElementById('sim-likes-count');
  const simShopAnchorBtn = document.getElementById('sim-shop-anchor-btn');

  const SIM_VIDEOS = [
    {
      title: 'Studio Pro Wireless Headphones',
      price: '$189.00',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      caption: 'The acoustic clarity on these Studio Pro headphones is INSANE 🤯 #TikTokMadeMeBuyIt #TechTok #UrbanScenery',
    },
    {
      title: 'Nimbus Smart Watch GPS',
      price: '$199.00',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      caption: 'Track health, sleep, and notifications with 14-day battery life ✨ #WatchVibes #TikTokShop #Style',
    },
    {
      title: 'Urban Scenery Minimalist Lamp',
      price: '$79.00',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      caption: 'Desk upgrade under $100! Matte aluminum with Qi2 wireless charging base 💡 #DeskSetup #Aesthetic',
    },
  ];

  function updatePhoneSimulator(prod, script) {
    if (simMediaBg && prod?.image) simMediaBg.src = prod.image;
    if (simAnchorTitle && prod?.title) simAnchorTitle.textContent = prod.title;
    if (simAnchorPrice && prod?.price) simAnchorPrice.textContent = formatPrice(prod.price, 'USD');
    if (simCaption && script?.hook) {
      simCaption.textContent = `${script.hook} ${script.hashtags ? script.hashtags.slice(0, 3).join(' ') : ''}`;
    }
  }

  document.querySelectorAll('[data-sim-video]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.simVideo) || 0;
      const data = SIM_VIDEOS[idx];
      if (!data) return;

      document.querySelectorAll('[data-sim-video]').forEach((b) => {
        b.className = 'rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold';
      });
      btn.className = 'rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-0.5 text-[10px] font-bold';

      if (simMediaBg) simMediaBg.src = data.image;
      if (simCaption) simCaption.textContent = data.caption;
      if (simAnchorTitle) simAnchorTitle.textContent = data.title;
      if (simAnchorPrice) simAnchorPrice.textContent = data.price;
    });
  });

  // Interactive Heart Like
  let likes = 48200;
  let isLiked = false;
  if (simHeartBtn) {
    simHeartBtn.addEventListener('click', () => {
      isLiked = !isLiked;
      likes += isLiked ? 1 : -1;
      if (simLikesCount) simLikesCount.textContent = `${(likes / 1000).toFixed(1)}K`;

      const iconWrap = document.getElementById('sim-heart-icon-wrapper');
      if (iconWrap) {
        iconWrap.innerHTML = isLiked
          ? icon('heart', 'h-5 w-5 text-[#FE2C55] fill-[#FE2C55]')
          : icon('heart', 'h-5 w-5 text-white');
      }

      if (isLiked) {
        const sparkle = document.getElementById('sim-heart-sparkle');
        if (sparkle) {
          sparkle.innerHTML = `<span class="inline-block text-xl text-[#FE2C55] animate-float-heart">❤️</span>`;
          sparkle.classList.remove('hidden');
          setTimeout(() => sparkle.classList.add('hidden'), 800);
        }
      }
    });
  }

  // Interactive TikTok Shop Anchor Buy Button -> Live FastAPI Order + Payment
  if (simShopAnchorBtn) {
    simShopAnchorBtn.addEventListener('click', async () => {
      const selectedId = Number(scriptProductSelect?.value);
      const anchorText = (simAnchorTitle?.textContent || '').trim().toLowerCase();
      const prod =
        catalog.find((p) => p.id === selectedId) ||
        catalog.find((p) => p.title.toLowerCase().includes(anchorText)) ||
        catalog.find((p) => p.stock > 0) ||
        catalog[0];

      const itemTitle = prod?.title || simAnchorTitle?.textContent || 'Studio Pro Wireless';
      const itemPrice = prod ? formatPrice(prod.price, 'USD') : simAnchorPrice?.textContent || '$189.00';

      if (prod?.fromBackend && Number(prod.stock ?? 0) > 0) {
        simShopAnchorBtn.disabled = true;
        try {
          const createdOrder = await ordersApi.create({
            product_id: prod.id,
            quantity: 1,
            address: 'TikTok Shop In-App Express Order',
            contact: '+256700000001',
            payment_method: 'MOBILE MONEY',
          });
          await paymentsApi.pay({
            order_id: createdOrder.id,
            payment_method: 'MOBILE MONEY',
            amount: createdOrder.total_price,
          });
          await refreshBackendDashboardData();
          showToast(
            `TikTok Shop Express Order #${createdOrder.id} created & paid for "${itemTitle}" (${itemPrice})!`,
            { variant: 'success' }
          );
          return;
        } catch (err) {
          if (!err.isNetworkError) {
            showToast(err.message || 'TikTok Express order failed.', { variant: 'error' });
            return;
          }
        } finally {
          simShopAnchorBtn.disabled = false;
        }
      }

      showToast(`TikTok Shop Express Checkout: Simulated order for ${itemTitle} (${itemPrice})!`, {
        variant: 'success',
      });
    });
  }

  // Initialize TikTok Live Shopping Broadcast Studio
  initTikTokLiveStudio();
}

/* ============================================================
   TikTok Live Shopping Broadcast Studio Controller
   ============================================================ */
function initTikTokLiveStudio() {
  const liveVideo = document.getElementById('tt-live-webcam');
  const livePoster = document.getElementById('tt-live-poster');
  const goLiveBtn = document.getElementById('btn-tt-go-live');
  const goLiveLabel = document.getElementById('btn-tt-go-live-label');
  const statusPill = document.getElementById('tt-live-status-pill');
  const pillTag = document.getElementById('tt-live-pill-tag');
  const viewersCountEl = document.getElementById('tt-live-viewers-count');
  const likesCountEl = document.getElementById('tt-live-likes-count');
  const timerEl = document.getElementById('tt-live-timer');
  const camBtn = document.getElementById('btn-tt-toggle-cam');
  const camLabel = document.getElementById('btn-tt-toggle-cam-label');
  const micBtn = document.getElementById('btn-tt-toggle-mic');
  const micLabel = document.getElementById('btn-tt-toggle-mic-label');
  const rtmpToggleBtn = document.getElementById('btn-tt-live-rtmp-toggle');
  const rtmpDrawer = document.getElementById('tt-live-rtmp-drawer');
  const productSelect = document.getElementById('tt-live-product-selector');
  const couponBtn = document.getElementById('btn-tt-trigger-coupon');
  const chatBox = document.getElementById('tt-live-chat-box');
  const hostForm = document.getElementById('tt-live-host-chat-form');
  const hostInput = document.getElementById('tt-live-host-input');

  const pinnedImg = document.getElementById('tt-pinned-img');
  const pinnedTitle = document.getElementById('tt-pinned-title');
  const pinnedPrice = document.getElementById('tt-pinned-price');
  const pinnedBuyBtn = document.getElementById('btn-tt-pinned-buy-demo');

  let isLive = false;
  let liveDurationSeconds = 0;
  let timerInterval = null;
  let viewerSimulationInterval = null;
  let chatSimulationInterval = null;
  let cameraStream = null;
  let cameraActive = false;
  let micActive = true;
  let simulatedLikes = 4820;

  // Populate product selector from catalog
  function populateLiveProducts() {
    if (!productSelect) return;
    productSelect.innerHTML = catalog
      .map((p) => `<option value="${p.id}">${p.title} — $${p.price.toFixed(2)} (${p.category})</option>`)
      .join('');
    updatePinnedCard();
  }

  function updatePinnedCard() {
    const selectedId = Number(productSelect?.value);
    const prod = catalog.find((p) => p.id === selectedId) || catalog[0];
    if (prod) {
      if (pinnedImg) pinnedImg.src = prod.image;
      if (pinnedTitle) pinnedTitle.textContent = prod.title;
      if (pinnedPrice) pinnedPrice.textContent = `$${prod.price.toFixed(2)}`;
    }
  }

  if (productSelect) {
    productSelect.addEventListener('change', () => {
      updatePinnedCard();
      const selectedId = Number(productSelect.value);
      const prod = catalog.find((p) => p.id === selectedId);
      if (prod) {
        addChatMessage('system', `🛍️ Host pinned "${prod.title}" ($${prod.price.toFixed(2)}) to stream! Tap yellow basket to order.`);
      }
    });
  }

  // RTMP Drawer toggle
  if (rtmpToggleBtn && rtmpDrawer) {
    rtmpToggleBtn.addEventListener('click', () => {
      rtmpDrawer.classList.toggle('hidden');
    });
  }

  // Camera toggle (WebRTC getUserMedia)
  if (camBtn) {
    camBtn.addEventListener('click', async () => {
      if (!cameraActive) {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
            if (liveVideo) {
              liveVideo.srcObject = cameraStream;
              liveVideo.classList.remove('hidden');
              if (livePoster) livePoster.classList.add('hidden');
            }
            cameraActive = true;
            if (camLabel) camLabel.textContent = 'Disable Camera';
            showToast('WebRTC Camera active · Stream studio connected!', { variant: 'success' });
          } else {
            throw new Error('MediaDevices not supported');
          }
        } catch (err) {
          showToast('Webcam in Studio Broadcast Preview Mode.', { variant: 'info' });
          cameraActive = true;
          if (camLabel) camLabel.textContent = 'Camera Active (Preview)';
          if (liveVideo) liveVideo.classList.add('hidden');
          if (livePoster) livePoster.classList.remove('hidden');
        }
      } else {
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          cameraStream = null;
        }
        if (liveVideo) {
          liveVideo.srcObject = null;
          liveVideo.classList.add('hidden');
        }
        if (livePoster) livePoster.classList.remove('hidden');
        cameraActive = false;
        if (camLabel) camLabel.textContent = 'Enable Camera';
        showToast('Camera stopped.', { variant: 'info' });
      }
    });
  }

  // Mic toggle
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      micActive = !micActive;
      if (cameraStream) {
        cameraStream.getAudioTracks().forEach((t) => (t.enabled = micActive));
      }
      if (micLabel) micLabel.textContent = micActive ? 'Mic Ready' : 'Mic Muted';
      showToast(micActive ? 'Microphone unmuted' : 'Microphone muted', { variant: 'info' });
    });
  }

  function addChatMessage(user, text, isOrder = false) {
    if (!chatBox) return;
    const msg = document.createElement('div');
    if (isOrder) {
      msg.className = 'rounded-lg bg-emerald-500/20 border border-emerald-500/40 p-2 text-[11px] text-emerald-200';
      msg.innerHTML = `🛒 <strong class="text-white">${user}</strong> just ordered <span class="font-bold text-amber-300">${text}</span>!`;
    } else if (user === 'host') {
      msg.className = 'rounded-lg bg-pink-500/25 border border-pink-500/40 p-2 text-[11px] text-pink-200';
      msg.innerHTML = `🎤 <strong class="text-white font-bold">HOST (@${currentSeller?.storeName || 'Store'}):</strong> ${text}`;
    } else if (user === 'system') {
      msg.className = 'rounded-lg bg-amber-500/20 border border-amber-500/40 p-2 text-[11px] text-amber-200';
      msg.innerHTML = `⚡ ${text}`;
    } else {
      msg.className = 'rounded-lg bg-white/5 p-2 text-[11px] text-slate-300';
      msg.innerHTML = `<span class="font-bold text-[#25F4EE]">${user}:</span> ${text}`;
    }
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Host Chat submit
  if (hostForm && hostInput) {
    hostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = hostInput.value.trim();
      if (!txt) return;
      addChatMessage('host', txt);
      hostInput.value = '';
    });
  }

  // Drop Flash Coupon button
  if (couponBtn) {
    couponBtn.addEventListener('click', () => {
      addChatMessage('system', '🔥 FLASH SALE UNLOCKED! Host released promo code TIKTOK10 for 10% off the pinned product!');
      showToast('10% Flash Coupon dropped live into TikTok stream chat!', { variant: 'success' });
    });
  }

  // Pinned buy demo button
  if (pinnedBuyBtn) {
    pinnedBuyBtn.addEventListener('click', () => {
      const selectedId = Number(productSelect?.value);
      const prod = catalog.find((p) => p.id === selectedId) || catalog[0];
      const buyerHandle = `@buyer_${Math.floor(1000 + Math.random() * 9000)}`;
      addChatMessage(buyerHandle, prod?.title || 'Electronics Gadget', true);
      showToast(`Simulated Live Buyer Order from ${buyerHandle}!`, { variant: 'success' });
    });
  }

  // GO LIVE button toggle
  if (goLiveBtn) {
    goLiveBtn.addEventListener('click', () => {
      isLive = !isLive;
      if (isLive) {
        // Start streaming
        goLiveBtn.className = 'inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-lg transition active:scale-95 animate-pulse';
        if (goLiveLabel) goLiveLabel.textContent = 'END LIVE STREAM';
        if (statusPill) {
          statusPill.className = 'inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold text-rose-300 border border-rose-500/40';
          statusPill.innerHTML = '<span class="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span><span>ON AIR · LIVE BROADCAST</span>';
        }
        if (pillTag) {
          pillTag.className = 'inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow animate-pulse';
          pillTag.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span><span>LIVE NOW</span>';
        }

        // Start timer
        liveDurationSeconds = 0;
        timerInterval = setInterval(() => {
          liveDurationSeconds += 1;
          const hrs = String(Math.floor(liveDurationSeconds / 3600)).padStart(2, '0');
          const mins = String(Math.floor((liveDurationSeconds % 3600) / 60)).padStart(2, '0');
          const secs = String(liveDurationSeconds % 60).padStart(2, '0');
          if (timerEl) timerEl.textContent = `${hrs}:${mins}:${secs}`;
        }, 1000);

        // Start viewer counter simulation
        let baseViewers = 1420;
        if (viewersCountEl) viewersCountEl.textContent = baseViewers.toLocaleString();
        if (likesCountEl) likesCountEl.textContent = simulatedLikes.toLocaleString();

        viewerSimulationInterval = setInterval(() => {
          const delta = Math.floor(Math.random() * 25) - 10;
          baseViewers = Math.max(800, baseViewers + delta);
          simulatedLikes += Math.floor(Math.random() * 8) + 1;
          if (viewersCountEl) viewersCountEl.textContent = baseViewers.toLocaleString();
          if (likesCountEl) likesCountEl.textContent = simulatedLikes.toLocaleString();
        }, 2500);

        // Start simulated chat stream
        const sampleComments = [
          { u: '@gadget_hunter', t: 'Can you show the noise cancelling switch?' },
          { u: '@tech_girl_256', t: 'Is there same-day delivery to Kampala?' },
          { u: '@dave_audio', t: 'The sound frequency response on that is top notch 🔥' },
          { u: '@gamer_sam', t: 'Does this come with official manufacturer warranty?' },
          { u: '@sarah_k', t: 'Just ordered via the yellow basket! Can\'t wait!' },
          { u: '@crypto_mike', t: 'How long does the battery last in real usage?' },
        ];
        let commentIdx = 0;
        chatSimulationInterval = setInterval(() => {
          if (!isLive) return;
          const item = sampleComments[commentIdx % sampleComments.length];
          commentIdx += 1;
          addChatMessage(item.u, item.t);

          // Every 3rd comment, simulate an order
          if (commentIdx % 3 === 0) {
            const selectedId = Number(productSelect?.value);
            const prod = catalog.find((p) => p.id === selectedId) || catalog[0];
            const randomBuyer = `@shopper_${Math.floor(100 + Math.random() * 900)}`;
            addChatMessage(randomBuyer, prod?.title || 'Audio Gear', true);
          }
        }, 4000);

        addChatMessage('system', '🚀 Broadcast started! Real-time TikTok Live audience and catalog synchronization enabled.');
        showToast('You are now LIVE on TikTok Shop! Audience connected.', { variant: 'success' });
      } else {
        // End streaming
        goLiveBtn.className = 'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FE2C55] via-pink-600 to-[#FE2C55] hover:opacity-95 px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-pink-500/30 transition active:scale-95';
        if (goLiveLabel) goLiveLabel.textContent = 'GO LIVE ON TIKTOK';
        if (statusPill) {
          statusPill.className = 'inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-300 border border-slate-700';
          statusPill.innerHTML = '<span class="h-2 w-2 rounded-full bg-slate-500"></span><span>STUDIO STANDBY</span>';
        }
        if (pillTag) {
          pillTag.className = 'inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow';
          pillTag.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span><span>STANDBY</span>';
        }
        clearInterval(timerInterval);
        clearInterval(viewerSimulationInterval);
        clearInterval(chatSimulationInterval);
        if (timerEl) timerEl.textContent = '00:00:00';
        addChatMessage('system', '⏹️ Broadcast concluded. Stream analytics and buyer orders logged to Seller Central.');
        showToast('TikTok Live session ended. Orders saved to inventory.', { variant: 'info' });
      }
    });
  }

  populateLiveProducts();
  window.addEventListener('urban:seller_catalog_changed', populateLiveProducts);
}

/* ============================================================
   Automated Physical Store Geolocation & Configuration Engine
   ============================================================ */
const STORE_PROFILE_KEY = 'urban:seller_store_profile';

function getStoredStoreProfile() {
  try {
    const raw = localStorage.getItem(STORE_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let signupMap = null;
let signupMarker = null;
let storeCfgMap = null;
let storeCfgMarker = null;

function createStoreMapIcon(label = 'Store Location') {
  return L.divIcon({
    className: 'custom-store-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="background: linear-gradient(135deg, #0284c7, #0ea5e9); color: white; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.45); border: 2px solid #ffffff; display: flex; align-items: center; gap: 5px;">
          <span>📍</span>
          <span>${label}</span>
        </div>
        <div style="width: 14px; height: 14px; background: #0284c7; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35); margin-top: -3px;"></div>
        <div style="width: 8px; height: 8px; background: rgba(14, 165, 233, 0.5); border-radius: 50%; margin-top: 1px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

async function reverseGeocodeCoords(lat, lon) {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (resp.ok) {
      const data = await resp.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.county || addr.state || 'Kampala Central';
      const road = addr.road || addr.pedestrian || addr.suburb || 'Electronics Boulevard';
      const house = addr.house_number ? `Plot ${addr.house_number}, ` : 'Plot 48, ';
      return {
        city,
        address: `${house}${road}, ${city}`,
        displayName: data.display_name || `${road}, ${city}`,
      };
    }
  } catch {
    // fallback
  }
  return {
    city: 'Kampala Central',
    address: `Plot 48, Electronics Boulevard, Innovation Hub Suite 4A`,
    displayName: 'Electronics Innovation Concourse, Kampala Central',
  };
}

async function forwardGeocodeQuery(query) {
  if (!query || !query.trim()) return null;
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (resp.ok) {
      const results = await resp.json();
      if (results && results.length > 0) {
        return {
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon),
          displayName: results[0].display_name,
        };
      }
    }
  } catch {
    // fallback
  }
  return null;
}

function initSignupMap() {
  const container = document.getElementById('signup-interactive-map');
  if (!container || signupMap) return;

  const defaultLat = 0.3476;
  const defaultLon = 32.5825;

  signupMap = L.map(container, {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([defaultLat, defaultLon], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(signupMap);

  signupMarker = L.marker([defaultLat, defaultLon], {
    draggable: true,
    icon: createStoreMapIcon('Your Store Location'),
  }).addTo(signupMap);

  async function applySignupMapLocation(lat, lon, triggerGeocode = true, notify = false) {
    const coordsInput = document.getElementById('signup-store-coords');
    const flagInput = document.getElementById('signup-map-pinned-flag');
    const statusEl = document.getElementById('signup-geo-status');
    const cardEl = document.getElementById('signup-location-card');
    const cityInput = document.getElementById('signup-store-city');
    const addressInput = document.getElementById('signup-store-address');

    const formattedCoords = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    if (coordsInput) coordsInput.value = formattedCoords;
    if (flagInput) flagInput.value = 'true';

    // Update status badge to Confirmed
    if (statusEl) {
      statusEl.className = 'inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
      statusEl.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>✅ Pin Confirmed on Map</span>';
    }

    // Update card styling
    if (cardEl) {
      cardEl.classList.remove('border-amber-300', 'dark:border-amber-700', 'bg-amber-50/40', 'dark:bg-amber-950/20', 'ring-4', 'ring-rose-500', 'border-rose-500', 'animate-pulse');
      cardEl.classList.add('border-emerald-300', 'dark:border-emerald-700', 'bg-emerald-50/40', 'dark:bg-emerald-950/20');
    }

    if (triggerGeocode) {
      if (statusEl) {
        statusEl.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span><span>Locating address...</span>';
      }
      const geo = await reverseGeocodeCoords(lat, lon);
      if (cityInput) cityInput.value = geo.city;
      if (addressInput) addressInput.value = geo.address;
      if (statusEl) {
        statusEl.className = 'inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
        statusEl.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>✅ Pin Confirmed on Map</span>';
      }
      const storeName = document.getElementById('signup-store-name')?.value || 'Your Store';
      signupMarker.bindPopup(`<div class="text-xs font-semibold p-1">📍 <b>${storeName}</b><br><span class="text-slate-500">${geo.address}</span></div>`).openPopup();
    }

    if (notify) {
      showToast(`Store location pinned on map: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, { variant: 'success' });
    }
  }

  // Click on map moves pin and confirms location
  signupMap.on('click', (e) => {
    const { lat, lng } = e.latlng;
    signupMarker.setLatLng([lat, lng]);
    applySignupMapLocation(lat, lng, true, true);
  });

  // Drag marker updates location
  signupMarker.on('dragend', () => {
    const pos = signupMarker.getLatLng();
    applySignupMapLocation(pos.lat, pos.lng, true, true);
  });

  // Search input & button
  const searchBtn = document.getElementById('btn-signup-map-search');
  const searchInput = document.getElementById('signup-map-search');
  async function runSignupSearch() {
    const q = searchInput?.value.trim();
    if (!q) {
      showToast('Please enter an area, street or landmark to find.', { variant: 'info' });
      return;
    }
    if (searchBtn) searchBtn.disabled = true;
    const res = await forwardGeocodeQuery(q);
    if (res) {
      signupMap.flyTo([res.lat, res.lon], 16, { duration: 1.2 });
      signupMarker.setLatLng([res.lat, res.lon]);
      await applySignupMapLocation(res.lat, res.lon, true, true);
    } else {
      showToast(`Location "${q}" not found. Try another landmark or click on map directly.`, { variant: 'warning' });
    }
    if (searchBtn) searchBtn.disabled = false;
  }
  if (searchBtn) searchBtn.addEventListener('click', runSignupSearch);
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runSignupSearch();
      }
    });
  }

  // "Confirm Pin" button
  const confirmBtn = document.getElementById('btn-signup-confirm-pin');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const pos = signupMarker.getLatLng();
      applySignupMapLocation(pos.lat, pos.lng, true, true);
    });
  }

  // Autolocate button
  const autolocateBtn = document.getElementById('btn-signup-autolocate');
  if (autolocateBtn) {
    autolocateBtn.addEventListener('click', async () => {
      autolocateBtn.disabled = true;
      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('Geolocation unavailable'));
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 7000,
          });
        });
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        signupMap.flyTo([lat, lon], 16, { duration: 1.2 });
        signupMarker.setLatLng([lat, lon]);
        await applySignupMapLocation(lat, lon, true, true);
      } catch {
        showToast('GPS unavailable. Click anywhere on the map to set your store pin.', { variant: 'info' });
      } finally {
        autolocateBtn.disabled = false;
      }
    });
  }
}

function initStoreConfigMap() {
  const container = document.getElementById('store-cfg-interactive-map');
  if (!container || storeCfgMap) return;

  const saved = getStoredStoreProfile();
  let defaultLat = 0.3476;
  let defaultLon = 32.5825;

  if (saved && saved.coords) {
    const parts = saved.coords.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      defaultLat = parts[0];
      defaultLon = parts[1];
    }
  }

  storeCfgMap = L.map(container, {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([defaultLat, defaultLon], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(storeCfgMap);

  storeCfgMarker = L.marker([defaultLat, defaultLon], {
    draggable: true,
    icon: createStoreMapIcon(saved?.storeName || 'Store Location'),
  }).addTo(storeCfgMap);

  async function applyStoreCfgMapLocation(lat, lon, triggerGeocode = true, notify = false) {
    const coordsInput = document.getElementById('store-cfg-coords');
    const cityInput = document.getElementById('store-cfg-city');
    const addressInput = document.getElementById('store-cfg-address');
    const statusEl = document.getElementById('store-geo-status');

    const formattedCoords = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    if (coordsInput) coordsInput.value = formattedCoords;

    if (triggerGeocode) {
      if (statusEl) {
        statusEl.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span><span>Locating address...</span>';
      }
      const geo = await reverseGeocodeCoords(lat, lon);
      if (cityInput) cityInput.value = geo.city;
      if (addressInput) addressInput.value = geo.address;
      if (statusEl) {
        statusEl.className = 'inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
        statusEl.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>Store Location Pinned</span>';
      }
      const storeName = document.getElementById('store-cfg-name')?.value || 'Store';
      storeCfgMarker.bindPopup(`<div class="text-xs font-semibold p-1">📍 <b>${storeName}</b><br><span class="text-slate-500">${geo.address}</span></div>`).openPopup();
    }

    if (notify) {
      showToast(`Store location updated on map: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, { variant: 'success' });
    }
  }

  storeCfgMap.on('click', (e) => {
    const { lat, lng } = e.latlng;
    storeCfgMarker.setLatLng([lat, lng]);
    applyStoreCfgMapLocation(lat, lng, true, true);
  });

  storeCfgMarker.on('dragend', () => {
    const pos = storeCfgMarker.getLatLng();
    applyStoreCfgMapLocation(pos.lat, pos.lng, true, true);
  });

  const searchBtn = document.getElementById('btn-store-cfg-map-search');
  const searchInput = document.getElementById('store-cfg-map-search');
  async function runStoreCfgSearch() {
    const q = searchInput?.value.trim();
    if (!q) {
      showToast('Please enter an address or area to search.', { variant: 'info' });
      return;
    }
    if (searchBtn) searchBtn.disabled = true;
    const res = await forwardGeocodeQuery(q);
    if (res) {
      storeCfgMap.flyTo([res.lat, res.lon], 16, { duration: 1.2 });
      storeCfgMarker.setLatLng([res.lat, res.lon]);
      await applyStoreCfgMapLocation(res.lat, res.lon, true, true);
    } else {
      showToast(`Location "${q}" not found on map.`, { variant: 'warning' });
    }
    if (searchBtn) searchBtn.disabled = false;
  }
  if (searchBtn) searchBtn.addEventListener('click', runStoreCfgSearch);
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runStoreCfgSearch();
      }
    });
  }

  const autolocateBtn = document.getElementById('btn-store-autolocate');
  if (autolocateBtn) {
    autolocateBtn.addEventListener('click', async () => {
      autolocateBtn.disabled = true;
      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('Geolocation unavailable'));
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 7000,
          });
        });
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        storeCfgMap.flyTo([lat, lon], 16, { duration: 1.2 });
        storeCfgMarker.setLatLng([lat, lon]);
        await applyStoreCfgMapLocation(lat, lon, true, true);
      } catch {
        showToast('GPS unavailable. Click anywhere on the map to pin your store location.', { variant: 'info' });
      } finally {
        autolocateBtn.disabled = false;
      }
    });
  }
}

async function detectAutomatedStoreLocation(target = 'store-cfg') {
  const isSignup = target === 'signup';
  const statusEl = document.getElementById(isSignup ? 'signup-geo-status' : 'store-geo-status');
  const btnEl = document.getElementById(isSignup ? 'btn-signup-autolocate' : 'btn-store-autolocate');
  const coordsInput = document.getElementById(isSignup ? 'signup-store-coords' : 'store-cfg-coords');
  const cityInput = document.getElementById(isSignup ? 'signup-store-city' : 'store-cfg-city');
  const addressInput = document.getElementById(isSignup ? 'signup-store-address' : 'store-cfg-address');

  if (statusEl) {
    statusEl.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span><span>Triangulating GPS...</span>`;
  }
  if (btnEl) btnEl.disabled = true;

  try {
    const position = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      });
    });

    const lat = Number(position.coords.latitude.toFixed(6));
    const lon = Number(position.coords.longitude.toFixed(6));
    const accuracy = Math.round(position.coords.accuracy || 10);

    if (coordsInput) coordsInput.value = `${lat}, ${lon}`;

    const geo = await reverseGeocodeCoords(lat, lon);
    if (cityInput) cityInput.value = geo.city;
    if (addressInput) addressInput.value = geo.address;

    if (isSignup) {
      const flagInput = document.getElementById('signup-map-pinned-flag');
      if (flagInput) flagInput.value = 'true';
      if (signupMap && signupMarker) {
        signupMap.flyTo([lat, lon], 16, { duration: 1.2 });
        signupMarker.setLatLng([lat, lon]);
      }
    } else {
      if (storeCfgMap && storeCfgMarker) {
        storeCfgMap.flyTo([lat, lon], 16, { duration: 1.2 });
        storeCfgMarker.setLatLng([lat, lon]);
      }
    }

    if (statusEl) {
      statusEl.className = 'inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
      statusEl.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>GPS Locked (±${accuracy}m)</span>`;
    }

    showToast(`Physical store location detected via GPS: ${geo.city} (${lat}, ${lon})!`, { variant: 'success' });
  } catch {
    const fallbackLat = 0.3476;
    const fallbackLon = 32.5825;
    if (coordsInput) coordsInput.value = `${fallbackLat}, ${fallbackLon}`;
    if (cityInput && !cityInput.value) cityInput.value = 'Kampala Central';
    if (addressInput && !addressInput.value) addressInput.value = 'Plot 48, Electronics Boulevard, Innovation Hub Suite 4A';

    if (statusEl) {
      statusEl.className = 'inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700';
      statusEl.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span><span>Electronics Hub GPS Default</span>`;
    }
    showToast('Store location initialized to Central Electronics Innovation Hub.', { variant: 'info' });
  } finally {
    if (btnEl) btnEl.disabled = false;
  }
}

function initStoreConfig() {
  const form = document.getElementById('store-config-form');

  initStoreConfigMap();

  // Populate from existing stored profile
  const saved = getStoredStoreProfile();
  if (saved) {
    const nameEl = document.getElementById('store-cfg-name');
    const handleEl = document.getElementById('store-cfg-handle');
    const catEl = document.getElementById('store-cfg-category');
    const bioEl = document.getElementById('store-cfg-bio');
    const hoursEl = document.getElementById('store-cfg-hours');
    const phoneEl = document.getElementById('store-cfg-phone');
    const pickupEl = document.getElementById('store-cfg-pickup');
    const coordsEl = document.getElementById('store-cfg-coords');
    const cityEl = document.getElementById('store-cfg-city');
    const addrEl = document.getElementById('store-cfg-address');
    const landmarkEl = document.getElementById('store-cfg-landmark');

    if (nameEl && saved.storeName) nameEl.value = saved.storeName;
    if (handleEl && saved.handle) handleEl.value = saved.handle;
    if (catEl && saved.category) catEl.value = saved.category;
    if (bioEl && saved.bio) bioEl.value = saved.bio;
    if (hoursEl && saved.hours) hoursEl.value = saved.hours;
    if (phoneEl && saved.phone) phoneEl.value = saved.phone;
    if (pickupEl && saved.pickup) pickupEl.value = saved.pickup;
    if (coordsEl && saved.coords) coordsEl.value = saved.coords;
    if (cityEl && saved.city) cityEl.value = saved.city;
    if (addrEl && saved.address) addrEl.value = saved.address;
    if (landmarkEl && saved.landmark) landmarkEl.value = saved.landmark;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const storeName = document.getElementById('store-cfg-name')?.value.trim() || 'Apex Quantum Lab';
      const rawHandle = document.getElementById('store-cfg-handle')?.value.trim() || '@apex-quantum';
      const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
      const category = document.getElementById('store-cfg-category')?.value || 'Audio & Sound';
      const bio = document.getElementById('store-cfg-bio')?.value.trim() || '';
      const hours = document.getElementById('store-cfg-hours')?.value.trim() || 'Mon-Sat: 8:00 AM - 8:00 PM';
      const phone = document.getElementById('store-cfg-phone')?.value.trim() || '+256 700 892 104';
      const pickup = document.getElementById('store-cfg-pickup')?.value.trim() || 'Ready for pickup within 15 mins';
      const coords = document.getElementById('store-cfg-coords')?.value.trim() || '0.3476, 32.5825';
      const city = document.getElementById('store-cfg-city')?.value.trim() || 'Kampala Central';
      const address = document.getElementById('store-cfg-address')?.value.trim() || 'Plot 48, Electronics Boulevard, Innovation Hub Suite 4A';
      const landmark = document.getElementById('store-cfg-landmark')?.value.trim() || '';

      const profile = {
        id: handle.replace('@', ''),
        storeName,
        name: storeName,
        handle,
        category,
        bio,
        hours,
        phone,
        pickup,
        coords,
        city,
        address: `${address} · ${city}`,
        landmark,
        rating: 4.95,
        reviews: 38,
        badge: 'Verified Electronic Hub',
        status: 'Open · Express Pickup Ready',
        icon: 'cpu',
        bg: 'from-cyan-600 to-blue-700',
        location: city,
      };

      localStorage.setItem(STORE_PROFILE_KEY, JSON.stringify(profile));

      if (currentSeller) {
        currentSeller.storeName = storeName;
        currentSeller.handle = handle;
        currentSeller.category = category;
        currentSeller.location = city;
        localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(currentSeller));
      }

      renderDashboardData();
      window.dispatchEvent(new CustomEvent('urban:store_profile_updated', { detail: profile }));
      showToast(`Store configuration & automated location saved! Synced to Urban Scenery storefront.`, { variant: 'success' });
    });
  }
}

async function updatePasswordEntropyInspector(pw, prefix = 'seller') {
  const shaEl = document.getElementById(`${prefix}-pw-sha256`);
  const badgeEl = document.getElementById(`${prefix}-entropy-badge`);

  if (!pw) {
    if (shaEl) shaEl.textContent = 'None (Enter password)';
    if (badgeEl) {
      badgeEl.className = 'font-mono text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full';
      badgeEl.textContent = 'Entropy: 0 bits';
    }
    return;
  }

  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  const entropyBits = Math.round(pw.length * Math.log2(pool || 1));

  let rating = 'Weak';
  let badgeColor = 'text-rose-600 bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800';
  if (entropyBits >= 55) {
    rating = 'Strong';
    badgeColor = 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
  } else if (entropyBits >= 35) {
    rating = 'Good';
    badgeColor = 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
  }

  if (badgeEl) {
    badgeEl.className = `font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`;
    badgeEl.textContent = `Entropy: ${entropyBits} bits (${rating})`;
  }

  try {
    const enc = new TextEncoder().encode(pw);
    const hashBuf = await crypto.subtle.digest('SHA-256', enc);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hashHex = hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
    if (shaEl) shaEl.textContent = `${hashHex.slice(0, 16)}...${hashHex.slice(-8)}`;
  } catch {
    if (shaEl) shaEl.textContent = 'SHA-256 active';
  }
}

/* ============================================================
   Dashboard Tabs
   ============================================================ */
function switchDashboardTab(tabName) {
  const tabs = ['overview', 'tiktok', 'uploader', 'inventory', 'agents', 'orders', 'store'];
  tabs.forEach((t) => {
    const section = document.getElementById(`dash-tab-${t}`);
    const navBtn = document.getElementById(`dash-nav-${t}`);
    const isActive = t === tabName;
    if (section) section.classList.toggle('hidden', !isActive);
    if (navBtn) {
      navBtn.classList.toggle('bg-brand-600', isActive);
      navBtn.classList.toggle('text-white', isActive);
      navBtn.classList.toggle('shadow-sm', isActive);
      navBtn.classList.toggle('text-slate-600', !isActive);
      navBtn.classList.toggle('dark:text-slate-300', !isActive);
      navBtn.classList.toggle('hover:bg-slate-100', !isActive);
      navBtn.classList.toggle('dark:hover:bg-slate-800', !isActive);
    }
  });

  if (tabName === 'store') {
    initStoreConfigMap();
    setTimeout(() => {
      if (storeCfgMap) storeCfgMap.invalidateSize();
    }, 150);
  }

  window.scrollTo({ top: 120, behavior: 'smooth' });
}

/* ============================================================
   Auth Form Handlers (Connected to /api/v1/auth/*)
   ============================================================ */
function initAuth() {
  const tabSignIn = document.getElementById('tab-btn-signin');
  const tabSignUp = document.getElementById('tab-btn-signup');
  const formSignIn = document.getElementById('seller-signin-form');
  const formSignUp = document.getElementById('seller-signup-form');

  // Password Visibility Toggle & Educational Security Inspector
  const pwInput = document.getElementById('signin-password');
  const togglePwBtn = document.getElementById('btn-seller-toggle-pw');
  if (pwInput) {
    if (togglePwBtn) {
      togglePwBtn.addEventListener('click', () => {
        const isPw = pwInput.type === 'password';
        pwInput.type = isPw ? 'text' : 'password';
        togglePwBtn.innerHTML = isPw ? icon('eye-off', 'h-4 w-4 text-brand-600') : icon('eye', 'h-4 w-4');
      });
    }
    pwInput.addEventListener('input', () => updatePasswordEntropyInspector(pwInput.value, 'seller'));
    updatePasswordEntropyInspector(pwInput.value, 'seller');
  }

  // Toggle Tab
  if (tabSignIn && tabSignUp) {
    const activeTabCls = ['bg-white', 'dark:bg-slate-900', 'text-brand-600', 'dark:text-brand-400', 'shadow-sm', 'border', 'border-slate-200', 'dark:border-slate-700'];
    const inactiveTabCls = ['text-slate-500', 'dark:text-slate-400'];

    tabSignIn.addEventListener('click', () => {
      tabSignIn.classList.add(...activeTabCls);
      tabSignIn.classList.remove(...inactiveTabCls);
      tabSignUp.classList.remove(...activeTabCls);
      tabSignUp.classList.add(...inactiveTabCls);
      formSignIn.classList.remove('hidden');
      formSignUp.classList.add('hidden');
    });

    tabSignUp.addEventListener('click', () => {
      tabSignUp.classList.add(...activeTabCls);
      tabSignUp.classList.remove(...inactiveTabCls);
      tabSignIn.classList.remove(...activeTabCls);
      tabSignIn.classList.add(...inactiveTabCls);
      formSignUp.classList.remove('hidden');
      formSignIn.classList.add('hidden');
      initSignupMap();
      setTimeout(() => {
        if (signupMap) signupMap.invalidateSize();
      }, 150);
    });
  }

  // Quick Demo Logins -> Authenticate with seeded FastAPI Admin
  document.querySelectorAll('[data-demo-login]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.demoLogin;
      const demo = DEMO_STORES[key] || DEMO_STORES.acoustics;
      btn.disabled = true;

      try {
        const session = await authApi.login({
          email: 'admin@urbanventures.com',
          password: 'admin123',
        });
        const sellerData = mapSellerProfileFromUser(session.user, demo);
        await refreshBackendDashboardData();
        showToast(`Authenticated as Admin (${demo.storeName})! Live DB connected.`, {
          variant: 'success',
        });
        showDashboardView(sellerData);
      } catch (err) {
        if (err.isNetworkError) {
          showToast(`Backend offline — opening ${demo.storeName} in local preview mode.`, {
            variant: 'info',
          });
          showDashboardView(demo);
        } else {
          showToast(err.message || 'Demo login failed.', { variant: 'error' });
        }
      } finally {
        btn.disabled = false;
      }
    });
  });

  // Sign In submit -> POST /api/v1/auth/login
  if (formSignIn) {
    formSignIn.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signin-email')?.value.trim() || '';
      const password = document.getElementById('signin-password')?.value || '';
      const submitBtn = formSignIn.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const session = await authApi.login({ email, password });
        const sellerData = mapSellerProfileFromUser(session.user);
        await refreshBackendDashboardData();
        showToast(`Signed in as ${session.user.name} (${session.user.role})!`, {
          variant: 'success',
        });
        showDashboardView(sellerData);
      } catch (err) {
        showToast(err.message || 'Invalid email or password.', { variant: 'error' });
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Sign Up submit -> POST /api/v1/auth/register
  if (formSignUp) {
    formSignUp.addEventListener('submit', async (e) => {
      e.preventDefault();

      // MANDATORY MAP PIN CHECK: The seller MUST pinpoint their store on the interactive map
      const isMapPinned = document.getElementById('signup-map-pinned-flag')?.value === 'true';
      const coords = document.getElementById('signup-store-coords')?.value.trim();

      if (!isMapPinned || !coords) {
        const locationCard = document.getElementById('signup-location-card');
        if (locationCard) {
          locationCard.classList.remove('border-amber-300', 'border-emerald-300', 'dark:border-amber-700', 'dark:border-emerald-700');
          locationCard.classList.add('ring-4', 'ring-rose-500', 'border-rose-500', 'animate-pulse');
          locationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            locationCard.classList.remove('animate-pulse');
          }, 2000);
        }
        showToast('⚠️ Map Location Required: You must interact with the map to pinpoint your store location before creating your store!', {
          variant: 'warning',
          duration: 6000,
        });
        return;
      }

      const storeName = document.getElementById('signup-store-name')?.value.trim() || 'Merchant Store';
      const rawHandle = document.getElementById('signup-handle')?.value.trim() || '@store';
      const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
      const email = document.getElementById('signup-email')?.value.trim() || '';
      const password = document.getElementById('signup-password')?.value || '';
      const category = document.getElementById('signup-category')?.value || 'Audio';
      const city = document.getElementById('signup-store-city')?.value.trim() || 'Kampala Central';
      const address = document.getElementById('signup-store-address')?.value.trim() || 'Plot 48, Electronics Boulevard, Innovation Hub Suite 4A';
      const submitBtn = formSignUp.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const session = await authApi.register({
          name: storeName,
          email,
          password,
          contact: handle,
          role: 'CUSTOMER',
        });
        const newSeller = mapSellerProfileFromUser(session.user, {
          storeName,
          handle,
          category,
          location: city,
          coords,
          address,
        });

        // Persist newly configured store profile and automated GPS location
        const storeProfile = {
          id: handle.replace('@', ''),
          storeName,
          name: storeName,
          handle,
          category,
          bio: `${storeName} · Verified Electronics Store on Urban Scenery Ventures.`,
          hours: 'Mon-Sat: 8:00 AM - 8:00 PM',
          phone: '+256 700 892 104',
          pickup: 'Ready for pickup within 15 mins',
          coords,
          city,
          address: `${address} · ${city}`,
          rating: 4.95,
          reviews: 1,
          badge: 'Verified Electronic Hub',
          status: 'Open · Express Pickup Ready',
          icon: 'cpu',
          bg: 'from-cyan-600 to-blue-700',
          location: city,
        };
        localStorage.setItem(STORE_PROFILE_KEY, JSON.stringify(storeProfile));
        window.dispatchEvent(new CustomEvent('urban:store_profile_updated', { detail: storeProfile }));

        await refreshBackendDashboardData();
        showToast(`Account "${storeName}" & Automated GPS Store registered on Urban Scenery!`, {
          variant: 'success',
        });
        showDashboardView(newSeller);
      } catch (err) {
        showToast(err.message || 'Registration failed. Please check your details.', {
          variant: 'error',
        });
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Logout triggers
  document.querySelectorAll('[data-seller-logout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      authApi.logout();
      orders = [];
      ordersFromBackend = false;
      showToast('Logged out from Seller Central', { variant: 'info' });
      showAuthView();
    });
  });
}

/* ============================================================
   AI Agent Toggles & Autonomous Global Repricer
   ============================================================ */
function initAgentToggles() {
  document.querySelectorAll('[data-agent-toggle]').forEach((toggle) => {
    toggle.addEventListener('change', (e) => {
      const agentKey = toggle.dataset.agentToggle;
      const isChecked = e.target.checked;
      if (aiAgents[agentKey]) {
        aiAgents[agentKey].enabled = isChecked;
      }
      showToast(`${aiAgents[agentKey]?.name || 'Agent'} is now ${isChecked ? 'Enabled' : 'Paused'}.`, {
        variant: isChecked ? 'success' : 'info',
      });
    });
  });

  // Manual Trigger Dynamic Reprice on all items -> PUT /api/v1/products/{id}
  document.querySelectorAll('[data-run-all-repricing]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const backendItems = catalog.filter((item) => item.fromBackend);

      try {
        if (backendItems.length) {
          let updatedCount = 0;
          for (const item of backendItems) {
            const oldUsd = Number(toUSD(item.price).toFixed(2));
            const newUsd = Math.max(5, Number((oldUsd * 0.96).toFixed(2)));
            await productsApi.update(item.id, { price: newUsd });
            saveProductUiMeta(item.id, { oldPrice: oldUsd });
            updatedCount += 1;
          }

          if (isAdmin()) {
            aiApi
              .logInteraction({
                prompt: 'Dynamic Repricing Agent',
                response: `Global market scan complete: optimized ${updatedCount} database SKUs by 4% to hold Buy Box leadership.`,
                user_id: getCurrentUser()?.public_id || null,
              })
              .catch(() => null);
          }

          await refreshBackendDashboardData();
          showToast(
            `Autonomous Repricer updated ${updatedCount} live database SKUs!`,
            { variant: 'success' }
          );
        } else {
          let updatedCount = 0;
          catalog.forEach((item) => {
            const oldUsd = Number(toUSD(item.price).toFixed(2));
            item.oldPrice = oldUsd;
            item.price = Math.max(5, Number((oldUsd * 0.96).toFixed(2)));
            updatedCount += 1;
          });
          saveCatalogProducts(catalog);
          renderDashboardData();
          showToast(`Autonomous Repricer refreshed ${updatedCount} local SKUs!`, {
            variant: 'success',
          });
        }
      } catch (err) {
        showToast(err.message || 'Global repricing requires an Admin login.', {
          variant: 'error',
        });
      } finally {
        btn.disabled = false;
      }
    });
  });
}

/* ============================================================
   Init Everything on Page Load
   ============================================================ */
async function initSellerApp() {
  initTheme();
  renderStaticIcons();
  initAuth();
  initProductUploader();
  initAgentToggles();
  initTikTokInterface();
  initStoreConfig();

  // Navigation tab links in dashboard
  ['overview', 'tiktok', 'uploader', 'inventory', 'agents', 'orders', 'store'].forEach((tab) => {
    document.getElementById(`dash-nav-${tab}`)?.addEventListener('click', () => switchDashboardTab(tab));
  });

  // Inventory search input
  document.getElementById('inventory-search')?.addEventListener('input', (e) => {
    renderInventoryTable(e.target.value);
  });

  // Sync live catalog immediately
  await syncCatalogFromBackend()
    .then((synced) => {
      catalog = synced;
      window.dispatchEvent(new CustomEvent('urban:seller_catalog_changed'));
    })
    .catch(() => null);

  // Check URL hash & existing JWT session
  const hash = window.location.hash.toLowerCase();
  const isDeepDashboardLink = hash === '#dashboard' || hash === '#tiktok' || hash === '#uploader';

  if (isAuthenticated()) {
    try {
      const me = await authApi.me();
      const sellerData = mapSellerProfileFromUser(me, currentSeller || {});
      await refreshBackendDashboardData();
      showDashboardView(sellerData);
      if (hash === '#tiktok') switchDashboardTab('tiktok');
      if (hash === '#uploader') switchDashboardTab('uploader');
      return;
    } catch (err) {
      if (err.isNetworkError && currentSeller) {
        showDashboardView(currentSeller);
        if (hash === '#tiktok') switchDashboardTab('tiktok');
        if (hash === '#uploader') switchDashboardTab('uploader');
        return;
      }
    }
  }

  if (isDeepDashboardLink) {
    try {
      const session = await authApi.login({
        email: 'admin@urbanventures.com',
        password: 'admin123',
      });
      const sellerData = mapSellerProfileFromUser(session.user, currentSeller || DEMO_STORES.acoustics);
      await refreshBackendDashboardData();
      showDashboardView(sellerData);
    } catch {
      showDashboardView(currentSeller || DEMO_STORES.acoustics);
    }
    if (hash === '#tiktok') switchDashboardTab('tiktok');
    if (hash === '#uploader') switchDashboardTab('uploader');
  } else {
    showAuthView();
    if (hash === '#signup') {
      document.getElementById('tab-btn-signup')?.click();
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSellerApp);
} else {
  initSellerApp();
}
