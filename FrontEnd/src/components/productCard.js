import { icon } from '../icons.js';
import { isWished } from '../store.js';
import { formatPrice } from '../utils.js';

export function badgeClass(badge) {
  if (badge === 'Out of Stock') return 'bg-rose-600 text-white font-bold';
  if (badge === 'Limited Stock') return 'bg-amber-500 text-slate-950 font-bold';
  if (badge === 'Featured') return 'bg-accent-500 text-slate-950 font-bold';
  if (badge === 'Sale') return 'bg-brand-500 text-white font-bold';
  return 'bg-brand-600 text-white font-semibold';
}

export function wishButton(p, size = 'h-9 w-9', iconSize = 'h-4 w-4', idPrefix = 'wishlist') {
  const wished = isWished(p.id);
  return `
    <button type="button" id="${idPrefix}-${p.id}" data-wish-toggle="${p.id}"
      aria-pressed="${wished}" aria-label="Save ${p.title} to wishlist"
      class="wish-btn ${size} bg-white/85 dark:bg-slate-800/85 backdrop-blur hover:bg-white dark:hover:bg-slate-800 active:scale-90 shadow-sm">
      ${icon('heart', iconSize)}
    </button>`;
}

export function productCard(p) {
  return `
    <article class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 active:scale-[0.99]">
      <!-- Image area (click → quick view) -->
      <div class="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800/60 ${p.bg || ''}">
        <button type="button" id="quick-view-${p.id}" data-quick-view="${p.id}"
          class="absolute inset-0 grid place-items-center overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-400"
          aria-label="Quick view ${p.title}">
          ${
            p.image
              ? `<img src="${p.image}" alt="${p.title}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';" />
                 <div class="hidden h-full w-full place-items-center">${icon(p.icon || 'package', `h-16 w-16 sm:h-20 sm:w-20 ${p.fg || 'text-slate-600 dark:text-slate-400'} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`, { 'stroke-width': '1.25' })}</div>`
              : icon(p.icon || 'package', `h-16 w-16 sm:h-20 sm:w-20 ${p.fg || 'text-slate-600 dark:text-slate-400'} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`, { 'stroke-width': '1.25' })
          }
        </button>

        ${p.badge ? `<span class="pointer-events-none absolute left-2.5 top-2.5 sm:left-3 sm:top-3 rounded-full ${badgeClass(p.badge)} px-2.5 py-0.5 text-[10px] sm:text-[11px] uppercase tracking-wide shadow-sm">${p.badge}</span>` : ''}

        <div class="absolute right-2.5 top-2.5 sm:right-3 sm:top-3">${wishButton(p, 'h-8 w-8 sm:h-9 sm:w-9', 'h-3.5 w-3.5 sm:h-4 sm:w-4')}</div>

        <span class="pointer-events-none absolute inset-x-3 bottom-3 hidden items-center justify-center gap-2 rounded-xl bg-white/95 dark:bg-slate-900/95 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 opacity-0 shadow-md backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex md:translate-y-2">
          ${icon('eye', 'h-4 w-4 text-brand-500')} Quick view
        </span>
      </div>

      <div class="flex flex-1 flex-col p-3.5 sm:p-5">
        <div class="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span>${p.category}</span>
          ${
            p.shopName
              ? `<button type="button" data-filter-shop="${p.shopId}" data-shop-name="${p.shopName}"
                  class="truncate text-brand-500 hover:underline capitalize" title="Shop: ${p.shopName}">
                  ${p.shopName}
                </button>`
              : ''
          }
        </div>

        <h3 class="mt-1 font-semibold leading-snug text-slate-900 dark:text-white text-sm sm:text-base">
          <button type="button" data-quick-view="${p.id}" class="text-left hover:text-brand-500 dark:hover:text-brand-400 transition-colors line-clamp-2">${p.title}</button>
        </h3>

        <div class="mt-1.5 flex items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
          <div class="flex items-center gap-1">
            ${icon('star', 'h-3 w-3 sm:h-3.5 sm:w-3.5 fill-accent-400 text-accent-400')}
            <span class="font-medium text-slate-700 dark:text-slate-300">${p.rating}</span>
            <span class="text-[11px]">(${p.reviews})</span>
          </div>
          ${
            p.fromBackend
              ? p.stock <= 0 || p.status === 'EMPTY'
                ? `<span class="text-[11px] font-semibold text-rose-500">Out of stock</span>`
                : p.stock <= 10
                ? `<span class="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Only ${p.stock} left</span>`
                : `<span class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">${p.stock} in stock</span>`
              : ''
          }
        </div>

        <div class="mt-auto flex items-baseline gap-2 pt-3 sm:pt-4">
          <span class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="text-xs sm:text-sm text-slate-400 dark:text-slate-500 line-through">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>

        ${
          p.fromBackend && (p.stock <= 0 || p.status === 'EMPTY')
            ? `<button type="button" id="add-to-cart-${p.id}" disabled
                 class="mt-3 sm:mt-4 inline-flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed">
                 ${icon('alert-circle', 'h-3.5 w-3.5 sm:h-4 sm:w-4')}
                 <span>Out of Stock</span>
               </button>`
            : `<button type="button" id="add-to-cart-${p.id}" data-add-to-cart="${p.id}"
                 class="mt-3 sm:mt-4 inline-flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all duration-200 hover:shadow-brand-500/30 active:scale-[0.96] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200">
                 ${icon('shopping-cart', 'h-3.5 w-3.5 sm:h-4 sm:w-4')}
                 <span>Add to Cart</span>
               </button>`
        }
      </div>
    </article>`;
}
