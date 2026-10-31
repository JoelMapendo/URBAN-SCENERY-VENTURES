// Fonts
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import './style.css';

import {
  defaultProducts,
  getCatalogProducts,
  saveCatalogProducts,
  PRODUCTS_STORAGE_KEY,
} from './data/products.js';
import { renderStaticIcons, icon } from './icons.js';
import { showToast } from './components/toast.js';
import { initTheme } from './theme.js';
import { formatPrice, toUSD } from './utils.js';
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
const AGENTS_STORAGE_KEY = 'lumen:ai_agents_state';

// Load stored seller session or default
function getStoredSeller() {
  try {
    const raw = localStorage.getItem(SELLER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

let currentSeller = getStoredSeller();
let catalog = getCatalogProducts();

// Pre-configured demo stores for 1-click test
const DEMO_STORES = {
  acoustics: {
    storeName: 'Urban Scenery Acoustics',
    handle: '@urban-acoustics',
    email: 'founders@urbanscenery.io',
    category: 'Audio',
    plan: 'Verified Merchant · All Tools Included',
    rating: 4.9,
    ordersCount: 142,
    revenue: 48290,
    activeAgents: 4,
  },
  wearables: {
    storeName: 'Apex Wearables',
    handle: '@apex-wearables',
    email: 'partners@apexwear.io',
    category: 'Wearables',
    plan: 'Verified Merchant · All Tools Included',
    rating: 4.8,
    ordersCount: 98,
    revenue: 34120,
    activeAgents: 4,
  },
  kinetic: {
    storeName: 'Acro Kinetic Lab',
    handle: '@acro-kinetic',
    email: 'sales@acrokinetic.com',
    category: 'Footwear',
    plan: 'Verified Merchant · All Tools Included',
    rating: 4.7,
    ordersCount: 115,
    revenue: 29840,
    activeAgents: 3,
  },
};

// AI Agent Configurations
let aiAgents = {
  repricer: { enabled: true, name: 'Dynamic Repricing Agent', status: 'Active · Monitoring 8 SKUs', actions: 140 },
  copywriter: { enabled: true, name: 'Autonomous SEO & Copywriter', status: 'Active · 100% Listings Optimized', actions: 28 },
  forecaster: { enabled: true, name: 'Predictive Restock Forecaster', status: 'Active · Next reorder in 14 days', actions: 12 },
  supportBot: { enabled: true, name: '24/7 AI Customer Concierge', status: 'Active · 89 queries resolved today', actions: 89 },
};

// AI Agent live logs
const aiLogs = [
  { time: '2 mins ago', agent: 'Dynamic Repricing Agent', text: 'Adjusted Studio Pro Wireless price from $199.00 to $189.00 to win Buy Box against competitor.', badge: 'Reprice', color: 'emerald' },
  { time: '14 mins ago', agent: 'AI Customer Concierge', text: 'Answered inquiry for Order #LM-8491 regarding overnight carrier tracking.', badge: 'Support', color: 'brand' },
  { time: '48 mins ago', agent: 'Predictive Forecaster', text: 'Generated inventory replenishment recommendation: Restock 30 units of Nimbus Smart Watch within 6 days.', badge: 'Stock', color: 'amber' },
  { time: '2 hours ago', agent: 'SEO & Copywriter Agent', text: 'Enhanced search meta keywords for Drift Running Sneakers, boosting expected search volume by +14%.', badge: 'SEO', color: 'accent' },
  { time: '4 hours ago', agent: 'Dynamic Repricing Agent', text: 'Verified minimum profit margin floor (30%) on 12 variant combinations.', badge: 'Safety', color: 'slate' },
];

// Sample Orders
const initialOrders = [
  { id: 'LM-8491', customer: 'Sophia Chen', item: 'Aurora Wireless Headphones', amount: 129.00, date: 'Today, 2:40 PM', status: 'Processing', badge: 'bg-amber-100 text-amber-700' },
  { id: 'LM-8490', customer: 'Marcus Miller', item: 'Nimbus Smart Watch', amount: 199.00, date: 'Today, 1:15 PM', status: 'Shipped', badge: 'bg-blue-100 text-blue-700' },
  { id: 'LM-8489', customer: 'Elena Rostova', item: 'Haven Canvas Backpack', amount: 79.50, date: 'Today, 11:22 AM', status: 'Delivered', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'LM-8488', customer: 'Liam O’Connor', item: 'Drift Running Sneakers', amount: 89.99, date: 'Yesterday', status: 'Delivered', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'LM-8487', customer: 'Ava Patel', item: 'Beacon Ambient Desk Lamp', amount: 64.00, date: 'Yesterday', status: 'Delivered', badge: 'bg-emerald-100 text-emerald-700' },
];

let orders = [...initialOrders];

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

  // Header & Identity
  document.querySelectorAll('[data-seller-name]').forEach((el) => {
    el.textContent = currentSeller.storeName || 'Urban Scenery Acoustics';
  });
  document.querySelectorAll('[data-seller-handle]').forEach((el) => {
    el.textContent = currentSeller.handle || '@urban-acoustics';
  });
  document.querySelectorAll('[data-seller-plan]').forEach((el) => {
    el.textContent = currentSeller.plan || 'Pro Merchant AI';
  });
  document.querySelectorAll('[data-tt-account-handle]').forEach((el) => {
    el.textContent = `@${(currentSeller.handle || 'urban_scenery').replace('@', '')}_tiktok`;
  });

  // KPI HUD
  const revenueEl = document.getElementById('kpi-revenue');
  if (revenueEl) revenueEl.textContent = `$${(currentSeller.revenue || 48290).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const ordersEl = document.getElementById('kpi-orders');
  if (ordersEl) ordersEl.textContent = `${currentSeller.ordersCount || 142}`;

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
   Inventory & Catalog Table
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
          No products matching "${filterTerm}". Upload a new item using the AI Uploader above.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((item) => {
    const stock = item.stock || 24 + ((item.id * 7) % 65);
    const isLow = stock < 20;

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
              <p class="text-xs text-slate-400 font-mono">SKU: LM-${String(item.id).slice(-4).padStart(4, '0')} · ${item.category}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">
          <div>${formatPrice(item.price, 'USD')} ${item.oldPrice ? `<span class="ml-1 text-xs text-slate-400 line-through font-normal">${formatPrice(item.oldPrice, 'USD')}</span>` : ''}</div>
          <div class="text-[11px] font-normal text-slate-400">${formatPrice(item.price, 'UGX')}</div>
        </td>
        <td class="px-4 py-4 text-xs">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-2 w-2 rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
            <span class="font-medium text-slate-700 dark:text-slate-300">${stock} units</span>
            ${isLow ? '<span class="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">Low Stock</span>' : ''}
          </div>
        </td>
        <td class="px-4 py-4">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:text-brand-300">
            <span class="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            AI Monitored
          </span>
        </td>
        <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
          ${item.rating ? `${item.rating} ★ (${item.reviews || 0})` : 'New Listing'}
        </td>
        <td class="py-4 pl-4 pr-6 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button type="button" data-reprice-id="${item.id}" class="grid h-8 w-8 place-items-center rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 transition" title="Run AI Dynamic Reprice">
              ${icon('zap', 'h-4 w-4 text-accent-500')}
            </button>
            <button type="button" data-delete-id="${item.id}" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition" title="Delete Product">
              ${icon('trash-2', 'h-4 w-4')}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Attach Reprice buttons
  tbody.querySelectorAll('[data-reprice-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.repriceId);
      const prod = catalog.find((p) => p.id === id);
      if (!prod) return;

      const isUgx = prod.price >= 10000;
      const newPrice = isUgx
        ? Math.max(15000, Math.round((prod.price * 0.95) / 500) * 500)
        : Math.max(10, Math.round(prod.price * 0.95 * 100) / 100);
      prod.oldPrice = prod.price;
      prod.price = newPrice;
      saveCatalogProducts(catalog);
      renderInventoryTable(filterTerm);
      window.dispatchEvent(new CustomEvent('urban:seller_catalog_changed'));

      const formattedNew = formatPrice(newPrice, 'USD');
      // Add to AI log
      aiLogs.unshift({
        time: 'Just now',
        agent: 'Dynamic Repricing Agent',
        text: `Algorithm adjusted "${prod.title}" to ${formattedNew} to win market Buy Box.`,
        badge: 'Reprice',
        color: 'emerald',
      });
      renderAgentLogs();

      showToast(`AI Repricer adjusted "${prod.title}" to ${formattedNew} to capture Buy Box!`, { variant: 'success' });
    });
  });

  // Attach Delete buttons
  tbody.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.deleteId);
      const prod = catalog.find((p) => p.id === id);
      if (!confirm(`Are you sure you want to remove "${prod?.title || 'this product'}" from your catalog?`)) return;

      catalog = catalog.filter((p) => p.id !== id);
      saveCatalogProducts(catalog);
      renderInventoryTable(filterTerm);
      renderDashboardData();
      showToast('Product removed from catalog', { variant: 'info' });
    });
  });
}

/* ============================================================
   Orders Table
   ============================================================ */
function renderOrdersTable() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  tbody.innerHTML = orders.map((o) => {
    const actionLabel = o.status === 'Processing' ? 'Dispatch Order' : o.status === 'Shipped' ? 'Mark Delivered' : 'View Receipt';
    return `
      <tr class="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
        <td class="py-3.5 pl-6 pr-4 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">${o.id}</td>
        <td class="px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white">${o.customer}</td>
        <td class="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">${o.item}</td>
        <td class="px-4 py-3.5 text-xs text-slate-400">${o.date}</td>
        <td class="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">$${Number(o.amount).toFixed(2)}</td>
        <td class="px-4 py-3.5">
          <span class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${o.badge}">${o.status}</span>
        </td>
        <td class="py-3.5 pl-4 pr-6 text-right">
          <button type="button" data-order-action="${o.id}" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition">${actionLabel}</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-order-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ord = orders.find((o) => o.id === btn.dataset.orderAction);
      if (!ord) return;
      if (ord.status === 'Processing') {
        ord.status = 'Shipped';
        ord.badge = 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
        renderOrdersTable();
        showToast(`Order #${ord.id} dispatched with Express Logistics tracking!`, { variant: 'success' });
      } else if (ord.status === 'Shipped') {
        ord.status = 'Delivered';
        ord.badge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
        renderOrdersTable();
        showToast(`Order #${ord.id} marked as Delivered to ${ord.customer}.`, { variant: 'success' });
      } else {
        showToast(`Order #${ord.id}: ${ord.item} ($${ord.amount.toFixed(2)}) — Delivered to ${ord.customer}.`, { variant: 'info' });
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

  container.innerHTML = aiLogs.slice(0, 6).map((log) => `
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
  `).join('');
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

  // 3. Form Submit -> Upload Product
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const cat = categorySelect.value || 'Audio';
      const price = parseFloat(priceInput.value) || 99.0;
      const oldPrice = oldPriceInput.value ? parseFloat(oldPriceInput.value) : null;
      const desc = descTextarea.value.trim() || 'Premium quality crafted product.';
      const featuresRaw = featuresInput.value.trim();
      const features = featuresRaw ? featuresRaw.split(',').map((f) => f.trim()).filter(Boolean) : ['Fast shipping', '30-day returns', '1-year warranty'];

      const template = AI_PRESET_TEMPLATES[cat] || AI_PRESET_TEMPLATES.Audio;

      const stockInput = document.getElementById('upload-stock');
      const stock = parseInt(stockInput?.value, 10) || 50;
      const newProduct = {
        id: Date.now(),
        title,
        category: cat,
        shopId: currentSeller?.handle ? currentSeller.handle.replace('@', '') : 'urban-acoustics',
        shopName: currentSeller?.storeName || 'Urban Scenery Acoustics',
        price,
        oldPrice,
        stock,
        rating: 5.0,
        reviews: 1,
        icon: template.icon,
        badge: 'New Arrival',
        bg: template.bg,
        fg: template.fg,
        image: template.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80',
        description: desc,
        features,
      };

      catalog.unshift(newProduct);
      saveCatalogProducts(catalog);

      // Add to AI logs
      aiLogs.unshift({
        time: 'Just now',
        agent: 'Listing Optimizer Agent',
        text: `New listing "${title}" indexed with 100% SEO quality score. Automated pricing active.`,
        badge: 'Listed',
        color: 'brand',
      });

      renderDashboardData();
      form.reset();
      if (aiStatusBadge) aiStatusBadge.classList.add('hidden');

      showToast(`Product "${title}" successfully published to Urban Scenery Storefront!`, { variant: 'success' });

      // Switch to Inventory tab to see it
      switchDashboardTab('inventory');
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

  // Interactive TikTok Shop Anchor Buy Button
  if (simShopAnchorBtn) {
    simShopAnchorBtn.addEventListener('click', () => {
      const itemTitle = simAnchorTitle?.textContent || 'Studio Pro Wireless';
      const itemPrice = simAnchorPrice?.textContent || '$189.00';
      showToast(`TikTok Shop Express Checkout: Order placed for ${itemTitle} (${itemPrice})!`, { variant: 'success' });
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
   Auth Form Handlers (Sign In & Sign Up)
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

  // Quick Demo Logins
  document.querySelectorAll('[data-demo-login]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.demoLogin;
      const demo = DEMO_STORES[key] || DEMO_STORES.acoustics;
      showToast(`Welcome back, ${demo.storeName}! Loading Seller Dashboard...`, { variant: 'success' });
      setTimeout(() => {
        showDashboardView(demo);
      }, 400);
    });
  });

  // Sign In submit
  if (formSignIn) {
    formSignIn.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signin-email')?.value.trim() || 'demo@urbanscenery.io';
      const handle = email.includes('@') ? `@${email.split('@')[0]}` : `@${email}`;

      const sellerData = {
        storeName: email.split('@')[0].toUpperCase() + ' Studio',
        handle,
        email,
        category: 'Audio',
        plan: 'Verified Merchant · All Tools Included',
        rating: 4.9,
        ordersCount: 142,
        revenue: 48290,
        activeAgents: 4,
      };

      showToast('Signed in successfully! Launching Seller Central...', { variant: 'success' });
      setTimeout(() => {
        showDashboardView(sellerData);
      }, 400);
    });
  }

  // Sign Up submit
  if (formSignUp) {
    formSignUp.addEventListener('submit', (e) => {
      e.preventDefault();
      const storeName = document.getElementById('signup-store-name')?.value.trim() || 'My Merchant Store';
      const handle = document.getElementById('signup-handle')?.value.trim() || '@store';
      const email = document.getElementById('signup-email')?.value.trim() || 'seller@brand.com';
      const category = document.getElementById('signup-category')?.value || 'Audio';
      const plan = 'Verified Merchant · All Tools Included';

      const newSeller = {
        storeName,
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        email,
        category,
        plan,
        rating: 5.0,
        ordersCount: 0,
        revenue: 0,
        activeAgents: 4,
      };

      showToast(`Congratulations! "${storeName}" is registered. All automated selling tools are active and ready!`, { variant: 'success' });
      setTimeout(() => {
        showDashboardView(newSeller);
      }, 500);
    });
  }

  // Logout triggers
  document.querySelectorAll('[data-seller-logout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showToast('Logged out from Seller Central', { variant: 'info' });
      showAuthView();
    });
  });
}

/* ============================================================
   AI Agent Toggles & Simulator
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

  // Manual Trigger Dynamic Reprice on all items (bound to both Overview & Agent Command Center buttons)
  document.querySelectorAll('[data-run-all-repricing]').forEach((btn) => {
    btn.addEventListener('click', () => {
      let updatedCount = 0;
      catalog.forEach((item) => {
        if (Math.random() > 0.35) {
          const isUgx = item.price >= 10000;
          item.oldPrice = item.price;
          item.price = isUgx
            ? Math.max(15000, Math.round((item.price * 0.96) / 500) * 500)
            : Math.max(12, Math.round(item.price * 0.96 * 100) / 100);
          updatedCount += 1;
        }
      });
      saveCatalogProducts(catalog);
      renderInventoryTable();
      window.dispatchEvent(new CustomEvent('urban:seller_catalog_changed'));
      aiLogs.unshift({
        time: 'Just now',
        agent: 'Dynamic Repricing Agent',
        text: `Global market scan complete: optimized ${updatedCount || catalog.length} SKUs to hold Buy Box leadership.`,
        badge: 'Global Scan',
        color: 'emerald',
      });
      renderAgentLogs();
      showToast(`Autonomous Repricer scanned market & refreshed ${updatedCount || catalog.length} Buy Box prices!`, { variant: 'success' });
    });
  });
}

/* ============================================================
   Init Everything on Page Load
   ============================================================ */
function initSellerApp() {
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

  // Check URL hash for direct links (e.g. #login, #dashboard, #tiktok, #uploader)
  const hash = window.location.hash.toLowerCase();
  if (currentSeller || hash === '#dashboard' || hash === '#tiktok' || hash === '#uploader') {
    showDashboardView(currentSeller || DEMO_STORES.acoustics);
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
