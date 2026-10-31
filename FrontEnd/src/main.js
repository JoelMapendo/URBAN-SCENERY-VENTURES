// Fonts (self-hosted via npm — no Google Fonts request)
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import './style.css';

import { getCatalogProducts, getProduct } from './data/products.js';
import { renderStaticIcons, icon } from './icons.js';
import * as store from './store.js';
import { productCard } from './components/productCard.js';
import { initCartDrawer, openCart, closeCart, isCartOpen } from './components/cartDrawer.js';
import { initQuickView, openQuickView, closeQuickView, isQuickViewOpen } from './components/quickView.js';
import { initVisualSearch, closeVisualSearch, isVisualSearchOpen } from './components/visualSearch.js';
import { initShopsSection } from './components/shopsSection.js';
import { initWelcomeModal } from './components/welcomeModal.js';
import { showToast } from './components/toast.js';
import { plural, replayAnimation, formatPrice, toUGX, getSelectedCurrency, setSelectedCurrency } from './utils.js';
import { initTheme } from './theme.js';

/* ============================================================
   Elements & dynamic state
   ============================================================ */
let catalog = getCatalogProducts();

const grid = document.getElementById('product-grid');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptyText = document.getElementById('empty-text');
const resultsMeta = document.getElementById('results-meta');
const chipsEl = document.getElementById('category-chips');
const sortSelect = document.getElementById('sort-select');
const sidebarSortSelect = document.getElementById('sidebar-sort-select');
const searchCategorySelect = document.getElementById('search-category-select');
const productsSection = document.getElementById('products');
const mobileSearchPanel = document.getElementById('mobile-search-panel');
const header = document.getElementById('site-header');
const searchInputs = document.querySelectorAll('[data-search]');
const currencySelect = document.getElementById('currency-select');
const footerCurrencySelect = document.getElementById('currency-selector');

// Filters state
const filters = {
  category: 'all',
  shop: null,
  shopName: null,
  query: '',
  sort: 'featured',
  pricePreset: 'all',
  minPrice: null,
  maxPrice: null,
  verifiedOnly: false,
};

const SORTERS = {
  featured: (a, b) => (b.badge === 'Featured' ? 1 : 0) - (a.badge === 'Featured' ? 1 : 0) || a.id - b.id,
  'price-asc': (a, b) => toUGX(a.price) - toUGX(b.price),
  'price-desc': (a, b) => toUGX(b.price) - toUGX(a.price),
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
};

let activeFeaturedProductId = 101;
let trendingIndex = 0;

const scrollToProducts = () => productsSection?.scrollIntoView({ behavior: 'smooth' });

// Mobile grid column mode (1 or 2, default 2 for modern shopping app feel)
let mobileGridCols = Number(localStorage.getItem('lumen:mobile_grid_cols')) || 2;

function applyMobileGridCols() {
  const toggleBtn = document.getElementById('mobile-grid-toggle');
  if (!grid) return;
  if (mobileGridCols === 2) {
    grid.classList.remove('grid-cols-1');
    grid.classList.add('grid-cols-2');
    if (toggleBtn) {
      toggleBtn.innerHTML = `${icon('layout-grid', 'h-4 w-4')} <span class="text-[11px] font-semibold">2-Col</span>`;
      toggleBtn.setAttribute('aria-label', 'Switch to 1-column view');
    }
  } else {
    grid.classList.remove('grid-cols-2');
    grid.classList.add('grid-cols-1');
    if (toggleBtn) {
      toggleBtn.innerHTML = `${icon('layers', 'h-4 w-4')} <span class="text-[11px] font-semibold">1-Col</span>`;
      toggleBtn.setAttribute('aria-label', 'Switch to 2-column view');
    }
  }
}

/* ============================================================
   Hero Session Management
   ============================================================ */
function renderHeroFeatured(product) {
  const p = product || catalog.find((item) => item.id === activeFeaturedProductId) || catalog[0];
  if (!p) return;
  activeFeaturedProductId = p.id;

  const titleEl = document.getElementById('hero-featured-title');
  const catEl = document.getElementById('hero-featured-category');
  const priceEl = document.getElementById('hero-featured-price');
  const oldPriceEl = document.getElementById('hero-featured-oldprice');
  const discountEl = document.getElementById('hero-featured-discount');
  const descEl = document.getElementById('hero-featured-desc');
  const imgEl = document.getElementById('hero-featured-img');
  const viewBtn = document.getElementById('hero-featured-view-btn');
  const cartBtn = document.getElementById('hero-featured-cart-btn');
  const verifiedBadge = document.getElementById('hero-featured-verified-badge');

  if (titleEl) titleEl.textContent = p.title;
  if (catEl) catEl.textContent = p.category.toUpperCase();
  if (priceEl) priceEl.textContent = formatPrice(p.price);

  if (p.oldPrice && p.oldPrice > p.price) {
    if (oldPriceEl) {
      oldPriceEl.textContent = formatPrice(p.oldPrice);
      oldPriceEl.classList.remove('hidden');
    }
    if (discountEl) {
      const pct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
      discountEl.textContent = `Save ${pct}%`;
      discountEl.classList.remove('hidden');
    }
  } else {
    if (oldPriceEl) oldPriceEl.classList.add('hidden');
    if (discountEl) discountEl.classList.add('hidden');
  }

  if (descEl) descEl.textContent = p.description || 'Premium curated item uploaded by verified merchant partner.';
  if (imgEl && p.image) {
    imgEl.src = p.image;
    imgEl.alt = p.title;
    imgEl.dataset.quickView = String(p.id);
  }

  if (viewBtn) {
    viewBtn.dataset.quickView = String(p.id);
  }
  if (cartBtn) {
    cartBtn.dataset.addToCart = String(p.id);
  }

  if (verifiedBadge) {
    const isSeller = Boolean(p.shopName || p.id > 100);
    verifiedBadge.innerHTML = `${icon('shield-check', 'h-3 w-3 text-emerald-400')} <span>${isSeller ? `${p.shopName || 'Verified Seller Upload'}` : 'Curated Official'}</span>`;
  }

  // Highlight active mini card in trending strip
  document.querySelectorAll('[data-swap-hero]').forEach((card) => {
    const isActive = Number(card.dataset.swapHero) === p.id;
    card.classList.toggle('ring-2', isActive);
    card.classList.toggle('ring-amber-400', isActive);
  });
}

function renderTrendingStrip() {
  const container = document.getElementById('hero-trending-cards');
  if (!container) return;

  // Select 4 items from catalog (offset by trendingIndex)
  const items = [];
  const total = catalog.length;
  for (let i = 0; i < Math.min(4, total); i++) {
    const idx = (trendingIndex + i) % total;
    items.push(catalog[idx]);
  }

  container.innerHTML = items
    .map((item) => {
      const isActive = item.id === activeFeaturedProductId;
      return `
      <div class="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 border ${isActive ? 'border-amber-500 ring-2 ring-amber-400' : 'border-slate-200 dark:border-slate-800'} hover:border-brand-500 dark:hover:border-amber-400/60 p-2 sm:p-2.5 shadow-sm dark:shadow-none transition cursor-pointer" data-swap-hero="${item.id}">
        <div class="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
          <img src="${item.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80'}" alt="${item.title}" class="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
        </div>
        <h4 class="text-xs font-semibold text-slate-800 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-amber-400 transition">${item.title}</h4>
        <span class="text-[11px] font-bold text-brand-600 dark:text-amber-400 mt-0.5">${formatPrice(item.price)}</span>
      </div>`;
    })
    .join('');
}

function renderCategorySidebar() {
  const sidebar = document.getElementById('hero-categories-sidebar');
  if (!sidebar) return;

  const categories = [...new Set(catalog.map((p) => p.category))];
  sidebar.innerHTML = categories
    .map((cat) => {
      const count = catalog.filter((p) => p.category === cat).length;
      const isActive = filters.category === cat;
      return `
      <button type="button" data-hero-cat="${cat}" class="group flex items-center justify-between py-2 px-2.5 rounded-xl ${isActive ? 'bg-brand-50 dark:bg-amber-500/15 text-brand-600 dark:text-amber-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-amber-400'} transition text-left">
        <span>${cat}</span>
        <span class="rounded-full ${isActive ? 'bg-brand-100 dark:bg-amber-400/25 text-brand-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} px-2 py-0.5 text-[10px] font-bold group-hover:bg-brand-100 dark:group-hover:bg-amber-400/20 group-hover:text-brand-700 dark:group-hover:text-amber-300">${count}</span>
      </button>`;
    })
    .join('');
}

function renderYouMayLike() {
  const container = document.getElementById('you-may-like-container');
  if (!container) return;

  const candidates = catalog.filter((p) => p.id !== activeFeaturedProductId).slice(0, 3);
  const items = candidates.length === 3 ? candidates : catalog.slice(0, 3);

  container.innerHTML = items
    .map(
      (p) => `
    <div class="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none transition">
      <img src="${p.image}" alt="${p.title}" class="h-12 w-12 rounded-lg object-cover cursor-pointer" data-quick-view="${p.id}" />
      <div class="flex-1 min-w-0">
        <h5 class="text-xs font-semibold text-slate-800 dark:text-white truncate cursor-pointer hover:text-brand-600 dark:hover:text-amber-400 transition" data-quick-view="${p.id}">${p.title}</h5>
        <p class="text-[11px] font-bold text-brand-600 dark:text-amber-400">${formatPrice(p.price)}</p>
      </div>
      <button type="button" data-add-to-cart="${p.id}" class="grid h-8 w-8 place-items-center rounded-lg bg-accent-500 hover:bg-accent-400 text-slate-950 transition active:scale-95 shadow-sm" aria-label="Add ${p.title} to cart">
        ${icon('shopping-cart', 'h-4 w-4')}
      </button>
    </div>`,
    )
    .join('');
}

/* ============================================================
   Product grid, filters & sorting
   ============================================================ */
function getVisibleProducts() {
  const q = filters.query.trim().toLowerCase();
  return catalog
    .filter((p) => {
      if (filters.shop && p.shopId !== filters.shop) return false;
      if (filters.category === 'saved') return store.isWished(p.id);
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.verifiedOnly && !(p.shopName || p.id > 100)) return false;

      const priceUgx = toUGX(p.price);

      // Price presets (evaluated in UGX)
      if (filters.pricePreset === 'under-50k' && priceUgx >= 50000) return false;
      if (filters.pricePreset === '50k-200k' && (priceUgx < 50000 || priceUgx > 200000)) return false;
      if (filters.pricePreset === '200k-1m' && (priceUgx < 200000 || priceUgx > 1000000)) return false;
      if (filters.pricePreset === 'over-1m' && priceUgx <= 1000000) return false;

      // Custom price min / max
      if (filters.minPrice !== null && priceUgx < toUGX(filters.minPrice)) return false;
      if (filters.maxPrice !== null && priceUgx > toUGX(filters.maxPrice)) return false;

      return true;
    })
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
    .sort(SORTERS[filters.sort]);
}

function renderGrid() {
  if (!grid) return;
  const list = getVisibleProducts();
  const q = filters.query.trim();

  // Active shop filter pill
  const activeShopBanner = document.getElementById('active-shop-banner');
  if (activeShopBanner) {
    if (filters.shop && filters.shopName) {
      activeShopBanner.classList.remove('hidden');
      activeShopBanner.innerHTML = `
        <span class="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-300 px-3.5 py-1.5 text-xs text-amber-800 shadow-sm animate-fade-up">
          <span>Shop: <strong>${filters.shopName}</strong></span>
          <button type="button" id="clear-shop-filter" class="grid h-4 w-4 place-items-center rounded-full hover:bg-amber-200 transition text-amber-900" aria-label="Clear shop filter">
            ${icon('x', 'h-3 w-3')}
          </button>
        </span>`;
      document.getElementById('clear-shop-filter')?.addEventListener('click', () => {
        filters.shop = null;
        filters.shopName = null;
        renderGrid();
        showToast('Shop filter cleared', { variant: 'info' });
      });
    } else {
      activeShopBanner.classList.add('hidden');
      activeShopBanner.innerHTML = '';
    }
  }

  grid.innerHTML = list.map(productCard).join('');
  if (emptyState) emptyState.classList.toggle('hidden', list.length > 0);

  if (!list.length && emptyState) {
    const savedEmpty = filters.category === 'saved' && !q;
    if (emptyTitle) emptyTitle.textContent = savedEmpty ? 'No saved items yet' : 'No products found';
    if (emptyText) {
      emptyText.textContent = savedEmpty
        ? 'Tap the heart on any product to save it here.'
        : 'Try adjusting your search query, category or price range.';
    }
  }

  if (resultsMeta) {
    const where =
      filters.category === 'all'
        ? filters.shopName
          ? ` from ${filters.shopName}`
          : ''
        : filters.category === 'saved'
        ? ' in your wishlist'
        : ` in ${filters.category}`;
    resultsMeta.textContent = `Showing ${plural(list.length, 'product')}${where}${q ? ` for “${q}”` : ''}`;
  }
}

function renderChips() {
  if (!chipsEl) return;
  const categories = [...new Set(catalog.map((p) => p.category))];
  const chips = [
    { key: 'all', label: 'All', count: catalog.length },
    ...categories.map((c) => ({ key: c, label: c, count: catalog.filter((p) => p.category === c).length })),
    { key: 'saved', label: 'Saved', count: store.getWishlistCount(), icon: 'heart' },
  ];

  chipsEl.innerHTML = chips
    .map(
      (c) => `
      <button type="button" class="chip" id="chip-${c.key.toLowerCase().replace(/[^a-z0-9]/g, '-')}" data-category="${c.key}"
        aria-pressed="${filters.category === c.key}">
        ${c.icon ? icon(c.icon, 'h-4 w-4') : ''}${c.label}
        <span class="chip-count">${c.count}</span>
      </button>`,
    )
    .join('');
}

function setCategory(category) {
  filters.category = category;
  renderChips();
  renderCategorySidebar();
  renderGrid();
}

function resetFilters() {
  filters.category = 'all';
  filters.shop = null;
  filters.shopName = null;
  filters.sort = 'featured';
  filters.pricePreset = 'all';
  filters.minPrice = null;
  filters.maxPrice = null;
  filters.verifiedOnly = false;

  if (sortSelect) sortSelect.value = 'featured';
  if (sidebarSortSelect) sidebarSortSelect.value = 'featured';
  if (searchCategorySelect) searchCategorySelect.value = 'all';

  const minInp = document.getElementById('sidebar-price-min');
  const maxInp = document.getElementById('sidebar-price-max');
  if (minInp) minInp.value = '';
  if (maxInp) maxInp.value = '';

  const verifiedCheck = document.getElementById('sidebar-verified-only');
  if (verifiedCheck) verifiedCheck.checked = false;

  document.querySelectorAll('.price-range-btn').forEach((btn) => {
    btn.classList.remove('border-amber-500', 'bg-amber-500/10', 'text-amber-700', 'font-bold');
  });

  setSearch('');
  renderChips();
  renderCategorySidebar();
  renderGrid();
  showToast('Filters reset to default', { variant: 'info' });
}

/* ============================================================
   Search (inputs sync)
   ============================================================ */
function setSearch(value) {
  filters.query = value;
  searchInputs.forEach((input) => {
    if (input.value !== value) input.value = value;
  });
}

searchInputs.forEach((input) =>
  input.addEventListener('input', (e) => {
    setSearch(e.target.value);
    renderGrid();
  }),
);

['desktop-search-form', 'mobile-search-form'].forEach((id) => {
  const f = document.getElementById(id);
  f?.addEventListener('submit', (e) => {
    e.preventDefault();
    document.activeElement?.blur();
    if (searchCategorySelect && searchCategorySelect.value !== 'all') {
      filters.category = searchCategorySelect.value;
      renderChips();
    }
    renderGrid();
    scrollToProducts();
  });
});

if (searchCategorySelect) {
  searchCategorySelect.addEventListener('change', (e) => {
    if (e.target.value !== 'all') {
      setCategory(e.target.value);
      scrollToProducts();
    }
  });
}

/* ============================================================
   Badges
   ============================================================ */
function updateCartBadges(animate = true) {
  const count = store.getCartCount();
  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = count > 99 ? '99+' : String(count);
    if (animate) replayAnimation(badge, 'animate-bump');
  });
  document.querySelectorAll('[data-cart-label]').forEach((btn) =>
    btn.setAttribute('aria-label', `Open cart, ${plural(count, 'item')}`),
  );
}

function updateWishBadges(animate = true) {
  const count = store.getWishlistCount();
  document.querySelectorAll('[data-wish-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
    if (animate) replayAnimation(badge, 'animate-bump');
  });
}

/* ============================================================
   Global click handling (cards, quick view, wishlist, cart)
   ============================================================ */
const CHECK_SVG = icon('check', 'h-4 w-4', { 'stroke-width': '3' });

function handleAddToCart(button) {
  const product = getProduct(button.dataset.addToCart);
  if (!product) return;

  store.addToCart(product.id);
  showToast(`${product.title} added to cart`, { action: { label: 'View cart', onClick: openCart } });

  if (!button.dataset.original) button.dataset.original = button.innerHTML;
  button.innerHTML = `${CHECK_SVG}<span>Added!</span>`;
  button.classList.add('!bg-emerald-500', '!text-white');
  clearTimeout(button._resetTimer);
  button._resetTimer = setTimeout(() => {
    button.innerHTML = button.dataset.original;
    button.classList.remove('!bg-emerald-500', '!text-white');
  }, 1200);
}

function handleWishToggle(button) {
  const product = getProduct(button.dataset.wishToggle);
  if (!product) return;
  const added = store.toggleWishlist(product.id);
  showToast(added ? `${product.title} saved to wishlist` : `${product.title} removed from wishlist`, {
    variant: added ? 'wish' : 'info',
    action: added ? { label: 'View saved', onClick: showSaved } : undefined,
  });
}

function showSaved() {
  closeQuickView();
  closeCart();
  setCategory('saved');
  scrollToProducts();
}

document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add-to-cart]');
  if (addBtn) return handleAddToCart(addBtn);

  const wishBtn = e.target.closest('[data-wish-toggle]');
  if (wishBtn) return handleWishToggle(wishBtn);

  const qvBtn = e.target.closest('[data-quick-view]');
  if (qvBtn) return openQuickView(qvBtn.dataset.quickView);

  // Swap hero featured product from mini card click
  const swapBtn = e.target.closest('[data-swap-hero]');
  if (swapBtn) {
    const id = Number(swapBtn.dataset.swapHero);
    const item = catalog.find((p) => p.id === id);
    if (item) {
      renderHeroFeatured(item);
      showToast(`Featured: ${item.title}`, { variant: 'info' });
    }
    return;
  }

  // Hero category sidebar buttons
  const heroCatBtn = e.target.closest('[data-hero-cat]');
  if (heroCatBtn) {
    setCategory(heroCatBtn.dataset.heroCat);
    scrollToProducts();
    return;
  }

  // Sub-nav ribbon category buttons
  const ribbonCatBtn = e.target.closest('[data-cat-link]');
  if (ribbonCatBtn) {
    const cat = ribbonCatBtn.dataset.catLink;
    setCategory(cat);
    scrollToProducts();
    return;
  }

  // Shop by category photo cards
  const photoCatBtn = e.target.closest('[data-select-cat]');
  if (photoCatBtn) {
    setCategory(photoCatBtn.dataset.selectCat);
    scrollToProducts();
    return;
  }

  // Price range preset buttons
  const pricePresetBtn = e.target.closest('[data-price-range]');
  if (pricePresetBtn) {
    const preset = pricePresetBtn.dataset.priceRange;
    filters.pricePreset = filters.pricePreset === preset ? 'all' : preset;
    document.querySelectorAll('.price-range-btn').forEach((btn) => {
      const isSel = btn.dataset.priceRange === filters.pricePreset;
      btn.classList.toggle('border-amber-500', isSel);
      btn.classList.toggle('bg-amber-500/15', isSel);
      btn.classList.toggle('text-amber-800', isSel);
      btn.classList.toggle('font-bold', isSel);
    });
    renderGrid();
    return;
  }

  if (e.target.closest('[data-open-cart]')) return openCart();
  if (e.target.closest('[data-open-wishlist]')) return showSaved();
  if (e.target.closest('#sidebar-reset-filters') || e.target.closest('#empty-reset-btn')) return resetFilters();
});

// Category chip click
chipsEl?.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-category]');
  if (chip) setCategory(chip.dataset.category);
});

// Sort select handlers
[sortSelect, sidebarSortSelect].forEach((sel) => {
  sel?.addEventListener('change', (e) => {
    filters.sort = e.target.value;
    if (sortSelect) sortSelect.value = filters.sort;
    if (sidebarSortSelect) sidebarSortSelect.value = filters.sort;
    renderGrid();
  });
});

// Sidebar custom price apply
document.getElementById('sidebar-apply-price')?.addEventListener('click', () => {
  const minVal = parseFloat(document.getElementById('sidebar-price-min')?.value);
  const maxVal = parseFloat(document.getElementById('sidebar-price-max')?.value);
  filters.minPrice = !isNaN(minVal) ? minVal : null;
  filters.maxPrice = !isNaN(maxVal) ? maxVal : null;
  filters.pricePreset = 'all';
  renderGrid();
  showToast('Custom price filter applied');
});

// Verified only toggle
document.getElementById('sidebar-verified-only')?.addEventListener('change', (e) => {
  filters.verifiedOnly = e.target.checked;
  renderGrid();
});

// Trending strip prev / next buttons
document.getElementById('trending-strip-prev')?.addEventListener('click', () => {
  trendingIndex = (trendingIndex - 1 + catalog.length) % catalog.length;
  renderTrendingStrip();
});
document.getElementById('trending-strip-next')?.addEventListener('click', () => {
  trendingIndex = (trendingIndex + 1) % catalog.length;
  renderTrendingStrip();
});

// Shop by category photo strip scroll buttons
document.getElementById('cat-strip-prev')?.addEventListener('click', () => {
  const scrollEl = document.getElementById('shop-by-category-scroll');
  if (scrollEl) scrollEl.scrollBy({ left: -260, behavior: 'smooth' });
});
document.getElementById('cat-strip-next')?.addEventListener('click', () => {
  const scrollEl = document.getElementById('shop-by-category-scroll');
  if (scrollEl) scrollEl.scrollBy({ left: 260, behavior: 'smooth' });
});

// Currency selectors (top header & footer synced)
[currencySelect, footerCurrencySelect].forEach((sel) => {
  if (!sel) return;
  sel.value = getSelectedCurrency();
  sel.addEventListener('change', (e) => {
    const nextCurr = e.target.value.toUpperCase();
    setSelectedCurrency(nextCurr);
    if (currencySelect) currencySelect.value = nextCurr;
    if (footerCurrencySelect) footerCurrencySelect.value = nextCurr;
    renderHeroFeatured();
    renderTrendingStrip();
    renderYouMayLike();
    renderGrid();
    showToast(`Currency changed to ${nextCurr}`, { variant: 'info' });
  });
});

// Discover button: scroll to products
document.getElementById('ribbon-discover-btn')?.addEventListener('click', scrollToProducts);
document.getElementById('ribbon-all-cats-btn')?.addEventListener('click', scrollToProducts);

/* ============================================================
   Mobile bottom navigation & grid toggle
   ============================================================ */
const navButtons = document.querySelectorAll('[data-nav]');

function setActiveNav(name) {
  navButtons.forEach((btn) => {
    const active = btn.dataset.nav === name;
    btn.classList.toggle('text-amber-500', active);
    btn.classList.toggle('text-slate-400', !active);
    btn.toggleAttribute('aria-current', active);
  });
}

function toggleMobileSearch(force) {
  const open = force ?? mobileSearchPanel.classList.contains('hidden');
  mobileSearchPanel.classList.toggle('hidden', !open);
  setActiveNav(open ? 'search' : 'home');
  if (open) document.getElementById('mobile-search')?.focus();
}

navButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    const action = btn.dataset.nav;
    setActiveNav(action);
    switch (action) {
      case 'home':
        toggleMobileSearch(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'shops':
        toggleMobileSearch(false);
        document.getElementById('shops-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'search':
        toggleMobileSearch();
        break;
      case 'cart':
        toggleMobileSearch(false);
        openCart();
        break;
      case 'profile':
        window.location.href = 'seller.html';
        break;
    }
  }),
);

document.getElementById('mobile-grid-toggle')?.addEventListener('click', () => {
  mobileGridCols = mobileGridCols === 2 ? 1 : 2;
  localStorage.setItem('lumen:mobile_grid_cols', mobileGridCols);
  applyMobileGridCols();
  showToast(`Switched to ${mobileGridCols}-column view`, { variant: 'info' });
});

/* ============================================================
   Keyboard & misc
   ============================================================ */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (isVisualSearchOpen()) closeVisualSearch();
  else if (isQuickViewOpen()) closeQuickView();
  else if (isCartOpen()) closeCart();
  else if (!mobileSearchPanel?.classList.contains('hidden')) toggleMobileSearch(false);
});

const onScroll = () => header.classList.toggle('shadow-2xl', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

['newsletter-form', 'footer-newsletter-form'].forEach((id) => {
  const form = document.getElementById(id);
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.reset();
    showToast('Thanks! Check your inbox for 10% off.');
  });
});

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* ============================================================
   Store & Product Sync Subscriptions
   ============================================================ */
store.subscribe((change) => {
  if (change.type === 'cart') updateCartBadges();

  if (change.type === 'wishlist') {
    document.querySelectorAll(`[data-wish-toggle="${change.id}"]`).forEach((btn) => {
      btn.setAttribute('aria-pressed', String(change.added));
      const svg = btn.querySelector('svg');
      if (svg) replayAnimation(svg, 'animate-pop');
    });
    updateWishBadges();
    renderChips();
    if (filters.category === 'saved') renderGrid();
  }
});

// Dynamic seller/admin product sync
function reloadCatalogFromStorage(eventDetail) {
  catalog = eventDetail || getCatalogProducts();
  renderHeroFeatured();
  renderTrendingStrip();
  renderCategorySidebar();
  renderYouMayLike();
  renderChips();
  renderGrid();
}

window.addEventListener('lumen:products_updated', (e) => {
  reloadCatalogFromStorage(e.detail);
  showToast('Storefront updated with latest merchant products!', { variant: 'info' });
});

window.addEventListener('storage', (e) => {
  if (e.key === 'lumen:catalog_products_v2') {
    reloadCatalogFromStorage();
  }
});

/* ============================================================
   Initialization
   ============================================================ */
initTheme();
applyMobileGridCols();
renderStaticIcons();
renderHeroFeatured();
renderTrendingStrip();
renderCategorySidebar();
renderYouMayLike();
renderChips();
renderGrid();
updateCartBadges(false);
updateWishBadges(false);

initCartDrawer({ onShop: scrollToProducts });
initQuickView({ onAdded: openCart });
initVisualSearch({
  onSelectMatch: (product) => {
    filters.category = product.category;
    setSearch(product.title);
    renderChips();
    renderCategorySidebar();
    renderGrid();
    scrollToProducts();
    showToast(`Showing match for "${product.title}"`, { variant: 'info' });
  },
});
initShopsSection({
  onSelectShop: (shopId, shopName) => {
    filters.shop = shopId;
    filters.shopName = shopName;
    filters.category = 'all';
    renderChips();
    renderCategorySidebar();
    renderGrid();
    scrollToProducts();
    showToast(`Filtering items from ${shopName}`, { variant: 'info' });
  },
});
initWelcomeModal({ onExploreDeals: scrollToProducts });
