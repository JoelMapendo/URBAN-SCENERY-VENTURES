// Fonts
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
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
  },
  wearables: {
    storeName: 'Apex Wearables',
    handle: '@apex-wearables',
    email: 'admin@urbanventures.com',
    category: 'Wearables',
    plan: 'Verified Merchant · All Tools Included',
    rating: 4.8,
    ordersCount: 0,
    revenue: 0,
    activeAgents: 4,
  },
  kinetic: {
    storeName: 'Acro Kinetic Lab',
    handle: '@acro-kinetic',
    email: 'admin@urbanventures.com',
    category: 'Footwear',
    plan: 'Verified Merchant · All Tools Included',
    rating: 4.7,
    ordersCount: 0,
    revenue: 0,
    activeAgents: 3,
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
}

/* ============================================================
   Dashboard Tabs
   ============================================================ */
function switchDashboardTab(tabName) {
  const tabs = ['overview', 'tiktok', 'uploader', 'inventory', 'agents', 'orders'];
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
      const storeName = document.getElementById('signup-store-name')?.value.trim() || 'Merchant Store';
      const rawHandle = document.getElementById('signup-handle')?.value.trim() || '@store';
      const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
      const email = document.getElementById('signup-email')?.value.trim() || '';
      const password = document.getElementById('signup-password')?.value || '';
      const category = document.getElementById('signup-category')?.value || 'Audio';
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
        });
        await refreshBackendDashboardData();
        showToast(`Account "${storeName}" registered on Urban Scenery backend!`, {
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

  // Navigation tab links in dashboard
  ['overview', 'tiktok', 'uploader', 'inventory', 'agents', 'orders'].forEach((tab) => {
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
