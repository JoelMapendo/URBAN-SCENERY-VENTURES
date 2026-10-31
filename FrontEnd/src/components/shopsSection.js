import { curatedShops, retailStores } from '../data/shops.js';
import { icon } from '../icons.js';
import { showToast } from './toast.js';

let preferredStoreId = localStorage.getItem('lumen:preferred_store') || 'soho-ny';

export function renderShopsGrid() {
  const container = document.getElementById('curated-shops-grid');
  if (!container) return;

  container.innerHTML = curatedShops
    .map(
      (s) => `
      <article class="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl">
        <!-- Banner gradient header -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${s.bg} text-white shadow-md shadow-brand-900/10 transition group-hover:scale-105">
              ${icon(s.icon, 'h-6 w-6 text-white', { 'stroke-width': '1.5' })}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-accent-400 transition-colors">${s.name}</h3>
              </div>
              <p class="text-xs text-slate-400 dark:text-slate-500">${s.handle} · ${s.location}</p>
            </div>
          </div>
          <span class="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">${s.badge}</span>
        </div>

        <p class="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">${s.bio}</p>

        <div class="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            ${icon('star', 'h-3.5 w-3.5 fill-accent-400 text-accent-400')}
            <span class="font-bold text-slate-800 dark:text-slate-100">${s.rating}</span>
            <span>(${s.reviews} reviews)</span>
          </div>
          <button type="button" data-filter-shop="${s.id}" data-shop-name="${s.name}"
            class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/15 hover:bg-brand-500 dark:hover:bg-brand-500 px-4 py-2 text-xs font-semibold text-brand-600 dark:text-brand-300 hover:text-white dark:hover:text-white transition-all shadow-sm">
            Visit Shop ${icon('arrow-right', 'h-3.5 w-3.5')}
          </button>
        </div>
      </article>`,
    )
    .join('');
}

export function renderRetailStores() {
  const container = document.getElementById('retail-stores-grid');
  if (!container) return;

  container.innerHTML = retailStores
    .map((store) => {
      const isSelected = store.id === preferredStoreId;
      return `
      <div class="flex flex-col justify-between rounded-2xl border ${
        isSelected ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-500/10 ring-2 ring-brand-400' : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827]'
      } p-5 shadow-sm transition hover:shadow-md">
        <div>
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> ${store.status}
              </span>
              <h4 class="mt-1 font-bold text-slate-900 dark:text-white">${store.name}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">${store.address}</p>
            </div>
            ${
              isSelected
                ? `<span class="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">My Store</span>`
                : ''
            }
          </div>

          <div class="mt-4 space-y-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3 text-xs text-slate-600 dark:text-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Hours</span>
              <span class="font-medium text-slate-700 dark:text-slate-200">${store.hours}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Pickup</span>
              <span class="font-semibold text-brand-600 dark:text-accent-400">${store.pickup}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Phone</span>
              <a href="tel:${store.phone.replace(/[^\d+]/g, '')}" class="text-brand-600 dark:text-brand-400 hover:underline">${store.phone}</a>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-2 pt-2">
          <button type="button" data-set-store="${store.id}"
            class="flex-1 rounded-full border ${
              isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700'
            } py-2 text-xs font-semibold transition">
            ${isSelected ? 'Selected Store' : 'Set as My Store'}
          </button>
          <a href="https://maps.google.com/?q=${encodeURIComponent(store.address)}" target="_blank" rel="noopener noreferrer"
            class="grid h-8 w-8 place-items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-500 transition" aria-label="Directions to ${store.name}">
            ${icon('navigation', 'h-4 w-4')}
          </a>
        </div>
      </div>`;
    })
    .join('');
}

export function initShopsSection({ onSelectShop } = {}) {
  renderShopsGrid();
  renderRetailStores();

  // Curated shop filter click
  document.addEventListener('click', (e) => {
    const shopBtn = e.target.closest('[data-filter-shop]');
    if (shopBtn) {
      const shopId = shopBtn.dataset.filterShop;
      const shopName = shopBtn.dataset.shopName;
      if (onSelectShop) onSelectShop(shopId, shopName);
    }

    const setStoreBtn = e.target.closest('[data-set-store]');
    if (setStoreBtn) {
      preferredStoreId = setStoreBtn.dataset.setStore;
      localStorage.setItem('lumen:preferred_store', preferredStoreId);
      renderRetailStores();
      const store = retailStores.find((s) => s.id === preferredStoreId);
      if (store) showToast(`Set ${store.name} for local 2-hour pickup!`, { variant: 'info' });
    }
  });
}
